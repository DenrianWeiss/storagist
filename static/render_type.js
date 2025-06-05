function generateStorageLayoutHTML(jsonData) {
    // Check if the necessary data structure exists
    if (!jsonData || !jsonData.artifact || !jsonData.artifact.storageLayout) {
        return "<p>Error: 'artifact.storageLayout' not found in jsonData.</p>";
    }
    const storageLayout = jsonData.artifact.storageLayout;

    if (!storageLayout.storage || !storageLayout.types) {
        return "<p>Storage layout data (storage or types) is missing or invalid.</p>";
    }
    const { storage, types } = storageLayout;

    // Group variables by slot
    const slotsData = {};
    for (const item of storage) {
        const slotNum = parseInt(item.slot);
        if (isNaN(slotNum)) {
            console.warn(`Invalid slot number for item: ${item.label}`);
            continue;
        }
        if (!slotsData[slotNum]) {
            slotsData[slotNum] = [];
        }
        slotsData[slotNum].push({
            name: item.label, // This will be the base name for variables/structs
            typeKey: item.type,
            offset: parseInt(item.offset),
        });
    }

    let html = `<div class="storage-layout-container">`;
    html += `
<style>
    .storage-layout-container { 
        font-family: Consolas, 'Courier New', monospace; 
        margin: 20px; 
        background-color: #fff; 
        padding: 15px; 
        border-radius: 8px; 
        box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
    }
    .slot-header { 
        display: flex; 
        align-items: center; 
        margin-bottom: 2px; 
        padding-left: 100px; /* Adjusted to align with grid content */
    }
    .byte-ruler { 
        display: grid; 
        grid-template-columns: repeat(32, minmax(25px, 1fr)); 
        width: 100%; 
    }
    .byte-ruler span { 
        text-align: center; 
        font-size: 0.7em; 
        color: #777; 
        padding: 2px 0; 
        border-left: 1px solid #f0f0f0; 
        border-bottom: 1px solid #ddd;
    }
    .byte-ruler span:first-child { border-left: none; }

    .slot-row { 
        display: flex; 
        align-items: stretch; 
        margin-bottom: 8px; 
        min-height: 60px; 
    }
    .slot-label { 
        min-width: 80px; 
        font-weight: bold; 
        font-size: 0.9em; 
        padding-right: 10px; 
        text-align: right; 
        color: #333;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        border-right: 1px solid #ddd;
        margin-right: -1px; 
    }
    .slot-grid { 
        display: grid; 
        grid-template-columns: repeat(32, minmax(25px, 1fr)); 
        border: 1px solid #ccc; 
        width: 100%; 
        background-image: linear-gradient(to right, #f9f9f9 1px, transparent 1px);
        background-size: calc(100% / 32) 100%;
    }
    .byte-cell {
        min-height: 50px; 
        border-right: 1px dotted #eee; 
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 0.75em;
        overflow: hidden;
        position: relative;
        box-sizing: border-box;
        padding: 4px 2px;
        line-height: 1.2;
        word-break: break-all; 
        text-overflow: ellipsis;
        white-space: normal; 
    }
    .byte-cell:last-child { border-right: none; }

    .variable-block {
        background-color: #e6f7ff; 
        border: 1px solid #91d5ff; 
        color: #0050b3;
        cursor: help;
        text-align: center;
    }
    .variable-block .var-name { 
        font-weight: bold; 
        display: block; 
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .variable-block .var-type { 
        font-size: 0.9em; 
        color: #595959; 
        margin-top: 2px; 
        display: block;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    /* Style for struct members */
    .struct-member-block {
        background-color: #d0edf8; /* Slightly different shade for members */
        border-color: #7ec2e0;
        color: #003a75;
    }
    /* Style for struct containers (padding or overall struct block) */
    .struct-container-block {
        background-color: #f0f8ff; /* Lighter, like AliceBlue */
        border-style: dashed;
        border-color: #b0e0e6;
        color: #4682b4;
    }
    .struct-container-block .var-name, .struct-container-block .var-type {
        opacity: 0.8;
    }

    .empty-byte { 
        background-color: #fafafa; 
    }
    
    .byte-cell[title]:hover::after {
        content: attr(title);
        position: absolute;
        bottom: calc(100% + 5px); 
        left: 50%;
        transform: translateX(-50%);
        background-color: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 0.85em; 
        white-space: pre-wrap; 
        z-index: 1000; 
        width: max-content;
        max-width: 350px; 
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        pointer-events: none; 
    }
</style>
    `;

    const sortedSlotNumbers = Object.keys(slotsData).map(n => parseInt(n)).sort((a, b) => a - b);

    if (sortedSlotNumbers.length > 0) {
        html += `<div class="slot-header">`;
        html += `<div class="byte-ruler">`;
        for (let i = 31; i >= 0; i--) {
            html += `<span>${i}</span>`;
        }
        html += `</div></div>`;
    }

    // Helper function to recursively populate slotBytesInfo for struct members
    function populateSlotByteInfoForStructs(
        members, globalTypes, baseOffsetInSlot, namePrefix, currentSlot, slotBytesArray, parentStructName
    ) {
        for (const member of members) {
            const memberTypeInfo = globalTypes[member.type];
            if (!memberTypeInfo) {
                console.warn(`Type info for ${member.type} (member ${namePrefix}${member.label}) not found.`);
                continue;
            }
            const memberSizeInBytes = parseInt(memberTypeInfo.numberOfBytes);
            if (isNaN(memberSizeInBytes)) {
                console.warn(`Invalid numberOfBytes for member type ${member.type} (${namePrefix}${member.label})`);
                continue;
            }

            const memberActualOffsetInSlot = baseOffsetInSlot + parseInt(member.offset);
            const memberFullName = `${namePrefix}${member.label}`;

            if (memberTypeInfo.members && Array.isArray(memberTypeInfo.members)) { // Nested struct
                // 1. Mark the nested struct's container area first
                for (let i = 0; i < memberSizeInBytes; i++) {
                    const byteIdx = memberActualOffsetInSlot + i;
                    if (byteIdx < 32) {
                        // Only fill if byte is empty or holds a less specific (e.g., parent) container
                        if (!slotBytesArray[byteIdx] || slotBytesArray[byteIdx].isStructContainer) {
                            slotBytesArray[byteIdx] = {
                                name: memberFullName,
                                typeKey: member.type,
                                typeLabel: memberTypeInfo.label + " (struct)",
                                totalVarSize: memberSizeInBytes,
                                varOffsetInSlot: memberActualOffsetInSlot,
                                isStructContainer: true,
                                structPath: namePrefix.slice(0, -1) || parentStructName,
                                slot: currentSlot
                            };
                        }
                    } else break;
                }
                // 2. Recursively populate its members
                populateSlotByteInfoForStructs(
                    memberTypeInfo.members, globalTypes, memberActualOffsetInSlot, `${memberFullName}.`,
                    currentSlot, slotBytesArray, memberFullName
                );
            } else { // Simple member
                for (let i = 0; i < memberSizeInBytes; i++) {
                    const byteIdx = memberActualOffsetInSlot + i;
                    if (byteIdx < 32) {
                        // Member data takes precedence
                        slotBytesArray[byteIdx] = {
                            name: memberFullName,
                            typeKey: member.type,
                            typeLabel: memberTypeInfo.label,
                            totalVarSize: memberSizeInBytes,
                            varOffsetInSlot: memberActualOffsetInSlot,
                            isMember: true,
                            structPath: namePrefix.slice(0, -1) || parentStructName,
                            slot: currentSlot
                        };
                    } else break;
                }
            }
        }
    }


    for (const slotNumber of sortedSlotNumbers) {
        html += `<div class="slot-row">`;
        html += `<div class="slot-label">Slot ${slotNumber}</div>`;
        html += `<div class="slot-grid">`;

        const variablesInSlot = slotsData[slotNumber].sort((a, b) => a.offset - b.offset);
        const slotBytesInfo = new Array(32).fill(null);

        for (const variable of variablesInSlot) {
            const typeInfo = types[variable.typeKey];
            if (!typeInfo) {
                console.warn(`Type info for ${variable.typeKey} (variable ${variable.name}) not found.`);
                continue;
            }
            const varSizeInBytes = parseInt(typeInfo.numberOfBytes);
            if (isNaN(varSizeInBytes)) {
                console.warn(`Invalid numberOfBytes for type ${variable.typeKey} (${variable.name})`);
                continue;
            }

            if (typeInfo.members && Array.isArray(typeInfo.members)) { // Variable is a struct
                // 1. Mark the main struct's container area
                for (let i = 0; i < varSizeInBytes; i++) {
                    const byteIdx = variable.offset + i;
                    if (byteIdx < 32) {
                        if (!slotBytesInfo[byteIdx]) { // Only if byte is currently empty
                            slotBytesInfo[byteIdx] = {
                                name: variable.name,
                                typeKey: variable.typeKey,
                                typeLabel: typeInfo.label + " (struct)",
                                totalVarSize: varSizeInBytes,
                                varOffsetInSlot: variable.offset,
                                isStructContainer: true,
                                structPath: "", // Top-level struct has no parent struct path
                                slot: slotNumber
                            };
                        }
                    } else break;
                }
                // 2. Populate its members, which may overwrite parts of the container marking
                populateSlotByteInfoForStructs(
                    typeInfo.members, types, variable.offset, `${variable.name}.`,
                    slotNumber, slotBytesInfo, variable.name
                );
            } else { // Simple variable (not a struct)
                for (let i = 0; i < varSizeInBytes; i++) {
                    const currentByteOffsetInSlot = variable.offset + i;
                    if (currentByteOffsetInSlot < 32) {
                        // Simple variable data takes precedence if there's an overlap (though unlikely with correct offsets)
                        slotBytesInfo[currentByteOffsetInSlot] = {
                            name: variable.name,
                            typeKey: variable.typeKey,
                            typeLabel: typeInfo.label,
                            totalVarSize: varSizeInBytes,
                            varOffsetInSlot: variable.offset,
                            slot: slotNumber
                            // isMember and isStructContainer are implicitly false
                        };
                    } else {
                        break;
                    }
                }
            }
        }

        let currentByteToRender = 31;
        while (currentByteToRender >= 0) {
            const byteInfo = slotBytesInfo[currentByteToRender];

            if (byteInfo) {
                let segmentSpan = 0;
                let tempByteIdx = currentByteToRender;
                // Group bytes belonging to the same variable/member/container part
                while (tempByteIdx >= 0 &&
                    slotBytesInfo[tempByteIdx] &&
                    slotBytesInfo[tempByteIdx].name === byteInfo.name &&
                    slotBytesInfo[tempByteIdx].varOffsetInSlot === byteInfo.varOffsetInSlot &&
                    slotBytesInfo[tempByteIdx].isMember === byteInfo.isMember && // Differentiate member from its container
                    slotBytesInfo[tempByteIdx].isStructContainer === byteInfo.isStructContainer) {
                    segmentSpan++;
                    tempByteIdx--;
                }

                let title;
                const commonTitlePart = `\nDeclared Size: ${byteInfo.totalVarSize} bytes\nOffset in Slot: ${byteInfo.varOffsetInSlot}\nSlot: ${slotNumber}\nBytes in this segment: ${currentByteToRender} down to ${currentByteToRender - segmentSpan + 1}`;

                if (byteInfo.isMember) {
                    title = `Member: ${byteInfo.name}\n(of struct ${byteInfo.structPath})\nType: ${byteInfo.typeKey} (${byteInfo.typeLabel})${commonTitlePart}`;
                } else if (byteInfo.isStructContainer) {
                    let structContext = byteInfo.structPath ? `(member of ${byteInfo.structPath})` : "(top-level)";
                    title = `Struct: ${byteInfo.name} ${structContext}\nType: ${byteInfo.typeKey} (${byteInfo.typeLabel})\nTotal Struct Size: ${byteInfo.totalVarSize} bytes${commonTitlePart}`;
                } else { // Regular variable
                    title = `Variable: ${byteInfo.name}\nType: ${byteInfo.typeKey} (${byteInfo.typeLabel})${commonTitlePart}`;
                }

                let varNameDisplay = escapeHTML(byteInfo.name);
                // For members, we might want to display only the last part of the name or indicate nesting
                if (byteInfo.isMember || (byteInfo.isStructContainer && byteInfo.structPath)) {
                    const nameParts = byteInfo.name.split('.');
                    varNameDisplay = escapeHTML(nameParts[nameParts.length -1]); // Show last part
                     if (nameParts.length > 1 && byteInfo.isMember) { // Add ellipsis for parent path for members
                        // varNameDisplay = `..${varNameDisplay}`; // or some other indicator
                    }
                }
                let varTypeDisplay = escapeHTML(byteInfo.typeLabel);

                let blockClasses = "byte-cell variable-block";
                if (byteInfo.isMember) {
                    blockClasses += " struct-member-block";
                } else if (byteInfo.isStructContainer) {
                    blockClasses += " struct-container-block";
                }

                html += `<div class="${blockClasses}" style="grid-column: span ${segmentSpan};" title="${escapeHTML(title)}">`;
                html += `<span class="var-name">${varNameDisplay}</span>`;
                html += `<span class="var-type">(${varTypeDisplay})</span>`;
                html += `</div>`;

                currentByteToRender -= segmentSpan;
            } else {
                html += `<div class="byte-cell empty-byte" title="Slot ${slotNumber}, Byte ${currentByteToRender}: Empty"></div>`;
                currentByteToRender--;
            }
        }
        html += `</div></div>`;
    }

    html += `</div>`;

    return html;
}

function generateStructLayout(sample) {
    if (!sample || !sample.artifact || !sample.artifact.storageLayout || !sample.artifact.storageLayout.types) {
        return "<p>Error: Invalid sample data or storageLayout missing.</p>";
    }
    const types = sample.artifact.storageLayout.types;
    let htmlOutput = `<div class="storage-layout-container">`;
    htmlOutput += `<style>
    .storage-layout-container { 
        font-family: Consolas, 'Courier New', monospace; 
        margin: 20px; 
        background-color: #fff; 
        padding: 15px; 
        border-radius: 8px; 
        box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
    }
    .slot-header { 
        display: flex; 
        align-items: center; 
        margin-bottom: 2px; 
        padding-left: 100px; /* Adjusted to align with grid content */
    }
    .byte-ruler { 
        display: grid; 
        grid-template-columns: repeat(32, minmax(25px, 1fr)); 
        width: 100%; 
    }
    .byte-ruler span { 
        text-align: center; 
        font-size: 0.7em; 
        color: #777; 
        padding: 2px 0; 
        border-left: 1px solid #f0f0f0; 
        border-bottom: 1px solid #ddd;
    }
    .byte-ruler span:first-child { border-left: none; }

    .slot-row { 
        display: flex; 
        align-items: stretch; 
        margin-bottom: 8px; 
        min-height: 60px; 
    }
    .slot-label { 
        min-width: 80px; 
        font-weight: bold; 
        font-size: 0.9em; 
        padding-right: 10px; 
        text-align: right; 
        color: #333;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        border-right: 1px solid #ddd;
        margin-right: -1px; 
    }
    .slot-grid { 
        display: grid; 
        grid-template-columns: repeat(32, minmax(25px, 1fr)); 
        border: 1px solid #ccc; 
        width: 100%; 
        background-image: linear-gradient(to right, #f9f9f9 1px, transparent 1px);
        background-size: calc(100% / 32) 100%;
    }
    .byte-cell {
        min-height: 50px; 
        border-right: 1px dotted #eee; 
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 0.75em;
        overflow: hidden;
        position: relative;
        box-sizing: border-box;
        padding: 4px 2px;
        line-height: 1.2;
        word-break: break-all; 
        text-overflow: ellipsis;
        white-space: normal; 
    }
    .byte-cell:last-child { border-right: none; }

    .variable-block {
        background-color: #e6f7ff; 
        border: 1px solid #91d5ff; 
        color: #0050b3;
        cursor: help;
        text-align: center;
    }
    .variable-block .var-name { 
        font-weight: bold; 
        display: block; 
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .variable-block .var-type { 
        font-size: 0.9em; 
        color: #595959; 
        margin-top: 2px; 
        display: block;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    /* Style for struct members */
    .struct-member-block {
        background-color: #d0edf8; /* Slightly different shade for members */
        border-color: #7ec2e0;
        color: #003a75;
    }
    /* Style for struct containers (padding or overall struct block) */
    .struct-container-block {
        background-color: #f0f8ff; /* Lighter, like AliceBlue */
        border-style: dashed;
        border-color: #b0e0e6;
        color: #4682b4;
    }
    .struct-container-block .var-name, .struct-container-block .var-type {
        opacity: 0.8;
    }

    .empty-byte { 
        background-color: #fafafa; 
    }
    
    .byte-cell[title]:hover::after {
        content: attr(title);
        position: absolute;
        bottom: calc(100% + 5px); 
        left: 50%;
        transform: translateX(-50%);
        background-color: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 0.85em; 
        white-space: pre-wrap; 
        z-index: 1000; 
        width: max-content;
        max-width: 350px; 
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        pointer-events: none; 
    }
    /* Keep existing styles for struct-diagram if they are still needed, or remove if the new styles cover everything */
    .struct-diagram table { border-collapse: collapse; margin-bottom: 20px; font-family: monospace, sans-serif; font-size: 12px; table-layout: fixed; width: auto; }
    .struct-diagram th, .struct-diagram td { border: 1px solid #ccc; padding: 5px; text-align: center; height: 40px; box-sizing: border-box; }
    .struct-diagram th { background-color: #f2f2f2; font-weight: bold; }
    .struct-diagram td { min-width: 28px; } /* Min width for individual byte cells */
    .struct-diagram td[colspan] { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: middle; font-weight: normal; }
    .struct-diagram h3 { font-family: sans-serif; margin-top: 30px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;}

</style>`;

    let foundStructs = false;
    for (const typeId in types) {
        const typeInfo = types[typeId];
        if (typeInfo.encoding === "inplace" && typeInfo.members && typeInfo.members.length > 0 &&
            typeInfo.label && typeInfo.label.startsWith("struct ")) {
            htmlOutput += generateStructDiagramHtml(typeInfo, types, typeId);
            foundStructs = true;
        }
    }
    if (!foundStructs) {
        htmlOutput += "<p>No structs with members found in the storage layout to display.</p>";
    }

    htmlOutput += "</div>";
    return htmlOutput;
}

function generateStructDiagramHtml(structDefinition, allTypes, structTypeId) {
    let html = `<div class="struct-diagram"><h3>${escapeHTML(structDefinition.label)}</h3>`;
    html += `<p style="font-size:0.9em; color:#555;">(Type ID: ${escapeHTML(structTypeId)}, Total Size: ${structDefinition.numberOfBytes} Bytes)</p>`;
    
    html += `<div class="slot-header"><div class="byte-ruler">`;
    for (let i = 31; i >= 0; i--) {
        html += `<span>${i}</span>`;
    }
    html += `</div></div>`;

    let numSlots = Math.max(1, Math.ceil(parseInt(structDefinition.numberOfBytes) / 32));
    if (parseInt(structDefinition.numberOfBytes) === 0 && structDefinition.members && structDefinition.members.length > 0) {
        const maxMemberSlot = structDefinition.members.reduce((max, member) => Math.max(max, parseInt(member.slot)), 0);
        numSlots = Math.max(1, maxMemberSlot + 1);
    }

    const slotsRepresentation = Array.from({ length: numSlots }, () => Array(32).fill(null));
    populateStructMembers(slotsRepresentation, structDefinition, allTypes, 0, 0, 0);

    for (let slotIndex = 0; slotIndex < numSlots; slotIndex++) {
        html += `<div class="slot-row">`;
        html += `<div class="slot-label">Slot ${slotIndex}</div>`;
        html += `<div class="slot-grid">`;
        
        const logicalCells = Array(32).fill(undefined); 

        for (let byteIdx = 0; byteIdx < 32; byteIdx++) { 
            if (logicalCells[byteIdx] === undefined) { 
                const cellInfo = slotsRepresentation[slotIndex][byteIdx];
                if (cellInfo && cellInfo.isStartOfSegment) {
                    let span = 0;
                    for (let s = 0; (byteIdx + s) < 32; s++) {
                        const lookaheadCell = slotsRepresentation[slotIndex][byteIdx + s];
                        if (lookaheadCell && lookaheadCell.name === cellInfo.name && lookaheadCell.depth === cellInfo.depth) {
                            span++;
                        } else {
                            break;
                        }
                    }
                    const hue = (cellInfo.depth * 50 + 200) % 360; 
                    const saturation = 60 + (cellInfo.depth * 5 % 21); 
                    const lightness = 80 + (cellInfo.depth * 3 % 16); 
                    const bgColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                    
                    let cellClasses = "byte-cell variable-block";
                    if (cellInfo.isStructContainer) cellClasses += " struct-container-block";
                    if (cellInfo.isStructMember) cellClasses += " struct-member-block";

                    const name = cellInfo.name;
                    const type = cellInfo.typeLabel;
                    const size = cellInfo.totalSize;
                    const depth = cellInfo.depth;

                    let roleDescription = "";
                    if (cellInfo.isStructContainer && cellInfo.isStructMember) {
                        roleDescription = "Struct Member (contains nested fields)";
                    } else if (cellInfo.isStructContainer && !cellInfo.isStructMember) {
                        roleDescription = "Struct Outline";
                    } else if (cellInfo.isStructMember && !cellInfo.isStructContainer) {
                        roleDescription = "Data Member";
                    } else {
                        roleDescription = "Layout Element";
                    }

                    const tooltipParts = [
                        `${name}`,
                        `Type: ${type}`,
                        `Size: ${size} bytes`,
                        `Nesting Depth: ${depth}`,
                        `Role: ${roleDescription}`
                    ];
                    const tooltipText = tooltipParts.join('\n');
                    const escapedTooltipText = escapeHTML(tooltipText);

                    logicalCells[byteIdx] = `<div class="${cellClasses}" style="grid-column: span ${span}; background-color: ${bgColor};" title="${escapedTooltipText}">
                                                <span class="var-name">${escapeHTML(name)}</span>
                                                <span class="var-type">${escapeHTML(type)} (${size}B)</span>
                                             </div>`;
                    for (let s = 1; s < span; s++) {
                        logicalCells[byteIdx + s] = ''; 
                    }
                } else { 
                    logicalCells[byteIdx] = '<div class="byte-cell empty-byte"></div>'; 
                }
            }
        }
        html += logicalCells.reverse().join(''); 
        html += '</div></div>'; 
    }

    html += '</div>'; 
    return html;
}

function populateStructMembers(targetSlotsArray, structToPopulate, allTypes, baseSlotForStruct, baseOffsetForStruct, depth, isParentStructContainer = false) {
    if (!structToPopulate.members) return;

    if (depth > 0 && isParentStructContainer) { 
        const structSizeInBytes = parseInt(structToPopulate.numberOfBytes);
        for (let k = 0; k < structSizeInBytes; k++) {
            const bytePosAbsolute = (baseSlotForStruct * 32) + baseOffsetForStruct + k;
            const slotToFill = Math.floor(bytePosAbsolute / 32);
            const byteInSlotToFill = bytePosAbsolute % 32;

            if (slotToFill < targetSlotsArray.length && byteInSlotToFill < 32) {
                 const isStart = (k === 0) || (byteInSlotToFill === 0 && k > 0);
                 const existingCell = targetSlotsArray[slotToFill][byteInSlotToFill];
                 if (existingCell === null || depth <= existingCell.depth) {
                    targetSlotsArray[slotToFill][byteInSlotToFill] = {
                        name: structToPopulate.label.replace(/^struct /, ''),
                        typeLabel: "struct",
                        totalSize: structSizeInBytes,
                        isStartOfSegment: isStart,
                        depth: depth -1, 
                        isStructContainer: true,
                        isStructMember: false 
                    };
                }
            }
        }
    }

    for (const member of structToPopulate.members) {
        const memberTypeInfo = allTypes[member.type];
        if (!memberTypeInfo) {
            console.warn(`Type info for ${member.type} (member ${member.label}) not found.`);
            continue;
        }

        const memberSizeInBytes = parseInt(memberTypeInfo.numberOfBytes);
        const memberSlotInStruct = parseInt(member.slot); 
        const memberOffsetInSlot = parseInt(member.offset); 

        let currentMemberStartByteAbsolute = (baseSlotForStruct * 32) + baseOffsetForStruct + (memberSlotInStruct * 32) + memberOffsetInSlot;

        if (memberTypeInfo.members && memberTypeInfo.encoding === "inplace") { 
             for (let k = 0; k < memberSizeInBytes; k++) {
                const bytePosAbsolute = currentMemberStartByteAbsolute + k;
                const slotToFill = Math.floor(bytePosAbsolute / 32);
                const byteInSlotToFill = bytePosAbsolute % 32;

                if (slotToFill < targetSlotsArray.length && byteInSlotToFill < 32) {
                    const isStart = (k === 0) || (byteInSlotToFill === 0 && k > 0);
                    const existingCell = targetSlotsArray[slotToFill][byteInSlotToFill];
                     if (existingCell === null || depth >= existingCell.depth ) { 
                        targetSlotsArray[slotToFill][byteInSlotToFill] = {
                            name: member.label,
                            typeLabel: memberTypeInfo.label,
                            totalSize: memberSizeInBytes,
                            isStartOfSegment: isStart,
                            depth: depth,
                            isStructContainer: true, 
                            isStructMember: true 
                        };
                    }
                }
            }
            populateStructMembers(targetSlotsArray, memberTypeInfo, allTypes,
                Math.floor(currentMemberStartByteAbsolute / 32), 
                currentMemberStartByteAbsolute % 32, 
                depth + 1,
                true); 
        } else { 
            for (let k = 0; k < memberSizeInBytes; k++) {
                const bytePosAbsolute = currentMemberStartByteAbsolute + k;
                const slotToFill = Math.floor(bytePosAbsolute / 32);
                const byteInSlotToFill = bytePosAbsolute % 32;

                if (slotToFill < targetSlotsArray.length && byteInSlotToFill < 32) {
                    const isStart = (k === 0) || (byteInSlotToFill === 0 && k > 0);
                    
                    const existingCell = targetSlotsArray[slotToFill][byteInSlotToFill];
                    if (existingCell === null || depth > existingCell.depth || (existingCell.isStructContainer && depth >= existingCell.depth && !existingCell.isStructMember)) {
                         targetSlotsArray[slotToFill][byteInSlotToFill] = {
                            name: member.label,
                            typeLabel: memberTypeInfo.label,
                            totalSize: memberSizeInBytes,
                            isStartOfSegment: isStart,
                            depth: depth,
                            isStructContainer: false,
                            isStructMember: true 
                        };
                    }
                }
            }
        }
    }
}

function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, function (match) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[match];
    });
}
