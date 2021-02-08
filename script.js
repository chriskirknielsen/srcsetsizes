var form = document.querySelector('form');
var output = document.querySelector('[data-output]');
var storageName = 'srcsetAndSizes';

function generate() {
    var defaults = document.querySelector('[data-type="src-default"]');
    var defaultSrc = defaults.querySelector('input[name="defpath"]').value.trim();
    var defaultWidth = defaults.querySelector('input[name="defwidth"]').value.trim();
    var defaultHeight = defaults.querySelector('input[name="defheight"]').value.trim();
    var srcset = [];
    var sizes = [];

    var dataGroups = Array.from(document.querySelectorAll('[data-type]'));
    dataGroups.forEach(group => {
        var groupType = group.getAttribute('data-type');

        if (groupType === 'src') {
            var srcPath = group.querySelector('input[name="filepath"]').value;
            var srcWidth = group.querySelector('input[name="filewidth"]').value;
            var srcDescriptor = group.querySelector('select[name="filedescriptor"]').value;
            
            if (srcPath && srcWidth && srcDescriptor) {
                srcset.push({ path: srcPath, w: srcWidth, desc: srcDescriptor });
            }
        }
        else if (groupType === 'size') {
            var sizeQuery = group.querySelector('input[name="query"]').value;
            var sizeElWidth = group.querySelector('input[name="elementwidth"]').value;

            if (sizeQuery && sizeElWidth) {
                sizes.push({ query: sizeQuery, elW: sizeElWidth });
            }
        }
    });

    var storage = {
        default: {
            path: defaultSrc,
            w: defaultWidth,
            h: defaultHeight
        },
        src: srcset,
        size: sizes
    };

    localStorage.setItem(storageName, JSON.stringify(storage));

    if (srcset.length > 0) { srcset.push({ path: defaultSrc }); }
    if (sizes.length > 0) { sizes.push({ elW: defaultWidth }); }

    var finalSrcset = (srcset.length > 0) ? `${srcset.map(src => `${src.path} ${src.w||''}${src.desc||''}`.trim()).join(', ')}` : false;
    var finalSizes = (sizes.length > 0) ? `${sizes.map(size => `${size.query||''} ${size.elW}px`.trim()).join(', ')}` : false;

    var finalOutput = `&lt;img
        src="${defaultSrc}"
        width="${defaultWidth}"
        height="${defaultHeight}"
        ${finalSrcset ? 'srcset="'+finalSrcset+'"' : ''}
        ${finalSizes ? 'sizes="'+finalSizes+'"' : ''}
        alt="Please describe your image."
    &gt;`.replaceAll("\t", '') // No tabs
        .split("\n") // Separate lines
        .map(l => l.trim()) // Remove spaces
        .filter(l => !!l) // Remove empty lines
        .join("\n") // Glue lines back together
        ;

    output.innerHTML = finalOutput;
}

function addInputs(type, cloneCallback = false, data = false) {
    // Find the right template
    var template = document.getElementById(`tpl-${type}`);
    
    // Only process existing templates
    if (!template) { return; }

    // Clone the template content
    var clone = template.content.cloneNode(true);

    // Modify the cloned content before inserting it into the document
    if (typeof cloneCallback === 'function') {
        cloneCallback(clone, data);
    }
    
    // Insert the new content before the button
    document.querySelector(`[data-add="${type}"]`).before(clone);
}

function removeInputs(targetButton) {
    // Only process the remove buttons
    if (!targetButton.hasAttribute('data-remove')) { return; }

    // Find the button's parent group wrapper element
    var parent = targetButton.closest('[data-type]');

    // Remove the parent element
    parent.remove();
}

function restoreFromStorage() {
    var stored = localStorage.getItem(storageName) || false;
    if (!restoreFromStorage) { return; }
    stored = JSON.parse(stored);

    var defaults = document.querySelector('[data-type="src-default"]');
    defaults.querySelector('input[name="defpath"]').value = stored.default.path;
    defaults.querySelector('input[name="defwidth"]').value = stored.default.w;
    defaults.querySelector('input[name="defheight"]').value = stored.default.h;

    for (var i = 0; i < stored.src.length; i++) {
        var srcValues = stored.src[i];
        
        if (!srcValues.path && !srcValues.w && !srcValues.desc) { return; }

        addInputs('src', (clone, data) => {
            clone.querySelector('input[name="filepath"]').value = data.path;
            clone.querySelector('input[name="filewidth"]').value = data.w;
            clone.querySelector('select[name="filedescriptor"]').value = data.desc;
        }, srcValues);
    }

    for (var j = 0; j < stored.size.length; j++) {
        var srcValues = stored.size[j];

        if (!srcValues.query && !srcValues.elE) { continue; }

        addInputs('size', (clone, data) => {
            clone.querySelector('input[name="query"]').value = data.query;
            clone.querySelector('input[name="elementwidth"]').value = data.elW;
        }, srcValues);
    }

    generate();
}

document.addEventListener('click', function (e) {
    if (e.target.hasAttribute('data-add')) {
        addInputs(e.target.getAttribute('data-add'));
    }
    
    removeInputs(e.target);
}, false);

form.addEventListener('change', generate, false);
form.addEventListener('blur', generate, false);
form.addEventListener('submit', function (e) {
    e.preventDefault();
    generate();
    return false;
}, false);

window.addEventListener('DOMContentLoaded', restoreFromStorage);

output.addEventListener('click', () => {
    output.focus();
    output.select();
});