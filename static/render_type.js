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
