// To-Do:
// Fix Memory Leaks from reset buttons

// Make sure that the website complies with the cookies law
// Edge gives warnings that might be worth fixing
// Separate add_dict_elements into smaller functions
// Move removal button to a harder to click place or make a confirmation message
// Make enter and the down/up arrow select input boxes below or above
// Materials may need information injected from another source so that users can choose from the current stock

// Default parameters won't work on internet explorer (create message that shows up if someone is using internet explorer?)

'use strict'

var data_sheet_values = {}
var section_values = {}
var data_sheet_variables_dict_original = {}
var data_sheet_variables_dict = {}

var additional_inputs = []
var num_additional_inputs = 0

var project_type = "small"

/**
 * Updates the global project_type variable to the current project type
 * @param {object} [event=""] The event given from a jquery input, if anything is given other than an empty string, this will be used instead of the other parameters
 * @param {string} [section_id="project_type_header"] The section id
 * @param {string} [subsection_id="inputs"] The subsection id
 * @param {string} [id="project_type"] The id of the project type selector
 * @param {string} [value="small"] The project type to set
 */
function update_project_type(event="", section_id="project_type_header", subsection_id="inputs", id="project_type", value="small") {
    if (event != "") {
        section_id = get_source_id(event.originalEvent.composedPath()[2].id)
        subsection_id = get_original_id(event.originalEvent.composedPath()[2].id)
        id = event.target.id
        project_type = event.target.value
    }
    else {
        project_type = value
    }

    data_sheet_variables_dict[section_id][subsection_id]["display_values"][id]["default_value"] = project_type
    update_data_dict_cookie()
}

/**
 * Updates the cookie that holds data with the current data
 */
function update_data_dict_cookie() {
    localStorage.setItem("data_sheet_variables_dict", JSON.stringify(data_sheet_variables_dict))
}

/**
 * Gets the cookie
 * @returns {string} the cookie which may need to be converted to an object with JSON.parse
 */
function get_data_dict_cookie() {
    let cookie = localStorage.getItem("data_sheet_variables_dict")

    if (cookie != null) {
        return cookie
    }
    else {
        return ""
    }
}

/**
 * Adds a query to an input text box that will run the given function
 * @param {string} id The id of the input box (without the #)
 * @param {string} event The event that will trigger the function (ie. blur, input, focus)
 * @param {function} func The function that gets triggered
 * @param {*} additional_args The additional arguments to be passed to the event
 */
function add_query_on_input(id, event, func, additional_args) {
    // Adds a query onto the element with the given id
    jQuery("#" + id).on(event, null, additional_args, func)
}

/**
 * 
 * @param {string} id The id of the element to be checked for changes
 * @param {function} func The function that gets triggered
 */
function add_query_on_change(id, func) {
    jQuery("#" + id).change(func)
}

/**
 * Gets the user interaction of a specific section in the data_sheet_variables_dict
 * @param {string} section_id The section id
 * @param {string} subsection_id The subsection id
 * @param {string} default_interaction The default user interaction if there isn't one available
 * @returns {string} the user_interaction
 */
function get_user_interaction(section_id, subsection_id, default_interaction = "") {
    let user_interaction = default_interaction
    if ("user_interaction" in data_sheet_variables_dict[section_id][subsection_id]) {
        user_interaction = data_sheet_variables_dict[section_id][subsection_id]["user_interaction"]
    }

    return user_interaction
}

// Function from Elias Zamaria, edited by T.J. Crowder
/**
 * Converts a number to a string with commas in every thousands place
 * @param {(string|float)} x The number to be converted
 * @returns {string} the number with commas added at every thousands place
 */
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Formats a given value into a currency format, the value is expected to already be a valid number (string or float)
 * @param {(string|float)} value The value to be formatted
 * @param {string} [format="float"] The format to be used for the value, accepts "int", "perc", "float", and "curr"
 * @returns {string} The formatted value with a dollar sign in front and to two decimal places
 */
function format_value(value, format="float") {
    // Returns the formatted float based on what the format is:
    //  curr is a currency, fixed to two decimals (ie. 5.00)
    //  int is an integer, a number (ie. 5)
    //  float will return the value to two decimals
    //  perc is a percentage (ie. 0.5 goes to 50%, 50 goes to 50%)
    //      perc formatting is based on if the value is greater than 1, if it is, it will do that as the percentage, otherwise, it multiplies by 100 and makes that the percent

    switch (format) {
        case "curr":
            return "$ " + numberWithCommas(parseFloat(value).toFixed(2))
        case "int":
            return numberWithCommas(parseInt(value))
        case "perc":
            let perc_value = parseFloat(value)
            // if (perc_value > 1){
            //     return perc_value + "%"
            // }
            // else {
            return numberWithCommas(perc_value * 100) + "%"
            // }
        case "float":
            return numberWithCommas(parseFloat(value).toFixed(2))
        default:
            return "$ " + numberWithCommas(parseFloat(value).toFixed(2))
    }
}

/**
 * Sets the value of the clicked event to the currency formatted version
 * @param {object} event The event given from jQuery that can be used to find the value
 */
function set_event_target_currency(event) {
    let value = event.target.value
    if (value == ".") {
        value = 0
    }
    // Checks if the string is a valid number
    if (jQuery.isNumeric(value)) {
        // Sets the value to the formatted version
        let format = false
        if (typeof event.data == "object") {
            if ("format" in event.data) {
                format = true
                event.target.value = format_value(value, event.data["format"])
            }
        }
        if(!format) {
            event.target.value = format_value(value)
        }
    }
}

/**
 * Used with the blur event to hide the input that was clicked while updating the label and showing it
 * @param {object} event The event given from jQuery
 */
function hide_label_input(event) {
    let input_id = event.target.id
    let label_id = get_source_id(event.target.id)
    
    document.querySelector("#" + input_id).style.display = "none"
    
    let new_value = document.querySelector("#" + input_id).value

    let section_id = get_source_id(event.originalEvent.composedPath()[2].id)
    let subsection_id = get_original_id(event.originalEvent.composedPath()[2].id)
    update_display_name(get_source_id(label_id), new_value, section_id, subsection_id)
    // data_sheet_variables_dict[section_id][subsection_id]["display_values"][get_source_id(label_id)]["display_name"] = new_value

    document.querySelector("#" + label_id).textContent = new_value
    document.querySelector("#" + label_id).style.display = "inline"
}

/**
 * Used with the click event to hide the label then show the input box while selecting it
 * @param {object} event The event given from jQuery
 */
function edit_label(event) {
    document.querySelector("#" + event.target.id).style.display = "none"

    let input_id = event.target.id + "_input"
    document.querySelector("#" + input_id).style.display = "inline"
    document.querySelector("#" + input_id).select()
}

/**
 * Makes a label editable by replacing it with an input once it is clicked
 * @param {string} label_id The id for the label that you want to make editable
 * @param {Element} parent_container The parent container that the label resides in
 */
function set_label_editable(label_id, parent_container) {

    let input_id = label_id + "_input"

    let label_input = create_input(input_id, input_id, "text", "", false)

    label_input.style.display = "none"
    // label_input.setAttribute("text-align", "left")
    label_input.value = document.querySelector("#" + label_id).textContent

    parent_container.insertBefore(label_input, document.querySelector("#" + label_id).nextSibling)

    add_query_on_input(label_id, "click", edit_label)
    add_query_on_input(input_id, "blur", hide_label_input)
}

/**
 * Updates the value at a spot in the data_sheet_values dict, 
 * if update_dict is true, it will also update the data_sheet_variables_dict
 * @param {string} id the id of the item
 * @param {float} new_value the value to be updated
 * @param {boolean} update_display_value updates the text content of the id if set to true
 * @param {string} display_value the display value to update the text content with
 * @param {boolean} update_dict if true, it will update data_sheet_variables_dict with the new value
 * @param {string} section_id section id in the dict (ie. monthly_overhead)
 * @param {string} subsection_id subsection id (ie. inputs)
 * @param {string} user_interaction the user interaction with this data sheet value
 */
function update_data_sheet_value(id, new_value, update_display_value = false, display_value = "", update_dict = true, section_id = "", subsection_id = "", user_interaction = "") {
    data_sheet_values[id] = new_value

    if (update_display_value) {
        let element = document.querySelector("#" + id)

        if (element.nodeName == "LABEL") {
            document.querySelector("#" + id).textContent = display_value
        }
        else if (element.nodeName == "INPUT") {
            document.querySelector("#" + id).value = display_value
        }
    }

    if (update_dict) {

        let is_material = false
        let material_update_index = 1
        if (user_interaction == "material") {
            is_material = true
            if (get_original_id(id) != "count") {
                material_update_index = 2
            }
            else {
                id = get_source_id(id)
            }
        }
        if (is_material) {
            data_sheet_variables_dict[section_id][subsection_id]["display_values"]["materials"]["default_values"][project_type][id][material_update_index] = new_value
            update_data_dict_cookie()
        }
        else {
            data_sheet_variables_dict[section_id][subsection_id]["display_values"][id]["default_value"] = new_value
            update_data_dict_cookie()
        }
    }
}

/**
 * Updates the display name of an element
 * @param {string} id The id of the element to have its name changed
 * @param {string} new_name The new name for the element
 * @param {string} [section_id=""] The section_id
 * @param {string} [subsection_id=""] The subsection_id
 * @param {string} [user_interaction=""] The user_interaction. This is only really used for materials which have a different path
 */
function update_display_name(id, new_name, section_id = "", subsection_id = "", user_interaction = "") {
    if (user_interaction == "material") {
        data_sheet_variables_dict[section_id][subsection_id]["display_values"]["materials"]["default_values"][project_type][id][0] = new_name
        update_data_dict_cookie()
    }
    else {
        data_sheet_variables_dict[section_id][subsection_id]["display_values"][id]["display_name"] = new_name
        update_data_dict_cookie()
    }
}

/**
 * Updates the materials section with the selected materials list based on the project type
 * @param {object} event The given event from a jquery input
 */
function update_materials(event) {
    // let user_interaction_temp = event.data["user_interaction_temp"]
    // let show_fixed_box_temp = event.data["show_fixed_box_temp"]
    // let default_fixed_value = event.data["default_fixed_value"]
    // let format_temp = event.data["format_temp"]
    // let allow_label_editing_temp = event.data["allow_label_editing_temp"]
    // let allow_removal_temp = event.data["allow_removal_temp"]
    let user_interaction_temp = "material"
    let show_fixed_box_temp = false
    let default_fixed_value = false
    let format_temp = "float"
    let allow_label_editing_temp = true
    let allow_removal_temp = true

    let section = "materials_header"
    let section_value = "inputs"

    let article_id = section + "_" + section_value

    let source_element = document.querySelector("#" + article_id)
    let exempt_element_array = []
    let first_child = source_element.firstChild
    while (first_child) {
        if (first_child.nodeName != "DIV") {
            exempt_element_array.push(first_child)
        }
        source_element.removeChild(first_child)
        first_child = source_element.firstChild
    }

    let material_object = data_sheet_variables_dict[section][section_value]["display_values"]["materials"]["default_values"][project_type]
    for (let material in material_object) {

        let material_name = material_object[material][0]
        let material_count = material_object[material][1]
        let material_value = material_object[material][2]

        add_input_div(
            article_id,
            material,
            "",
            user_interaction_temp,
            material_name,
            material_value,
            show_fixed_box_temp,
            default_fixed_value,
            format_temp,
            allow_label_editing_temp,
            allow_removal_temp,
            material_count)
    }

    for (let element of exempt_element_array) {
        document.querySelector("#" + article_id).appendChild(element)
    }
}

/**
 * Restricts the input of the target object based on if it is a valid number, if it isn't, it sets the value to the corresponding id value in the data_sheet_values object
 * @param {object} event The event given from jQuery that can be used to find information on the element
 */
function restrict_input(event) {
    let value = event.target.value
    let target_id = event.target.id

    let section_id = get_source_id(event.originalEvent.composedPath()[2].id)
    let subsection_id = get_original_id(event.originalEvent.composedPath()[2].id)

    let user_interaction = get_user_interaction(section_id, subsection_id)
    // if ("user_interaction" in data_sheet_variables_dict[section_id][subsection_id]) {
    //     user_interaction = data_sheet_variables_dict[section_id][subsection_id]["user_interaction"]
    // }

    let format = "float"

    if (get_original_id(target_id) == "count" || section_id == "materials_header") {
        format = "int"
    }
    else if ("format" in data_sheet_variables_dict[section_id][subsection_id]["display_values"][target_id]) {
        format = data_sheet_variables_dict[section_id][subsection_id]["display_values"][target_id]["format"]
        // if ( == "int") {
        //     is_int = true
        // }
    }

    // If the input isn't a number and isn't an empty string, it reverts it to the previous value
    if ((!jQuery.isNumeric(value) && value != "") && value != ".") {
        event.target.value = data_sheet_values[target_id]
    }
    // If it is a valid number or an empty string, updates the input values
    // If the value has a decimal in it, it is stored with the two decimals
    // If the value is an empty string, the input values only take that string
    // If the value is an int, it is simply stored as is
    else {
        if (value.includes(".")) {
            if (value == ".") {
                value = "0."
            }
            if (format == "int") {
                event.target.value = data_sheet_values[target_id]
            }
            else if (format == "perc") {
                update_data_sheet_value(target_id, parseFloat(value), false, "", true, section_id, subsection_id, user_interaction)
            }
            else {
                update_data_sheet_value(target_id, parseFloat(value).toFixed(2), false, "", true, section_id, subsection_id, user_interaction)
            }
            // data_sheet_values[target_id] = parseFloat(value).toFixed(2)
        }
        else if(value == "") {
            update_data_sheet_value(target_id, 0, false, "", true, section_id, subsection_id, user_interaction)
            // data_sheet_values[target_id] = value
        }
        else {
            update_data_sheet_value(target_id, parseInt(value), false, "", true, section_id, subsection_id, user_interaction)
            // data_sheet_values[target_id] = parseFloat(value)
        }
    }
}

/**
 * For easy editing, this reverts the formatted value of the event object to its raw value equivalent
 * @param {object} event The event given from jQuery that can be used to find information on the element
 */
function focus_input(event) {
    let target_id = event.target.id

    // Updates the value to be the input version of the value
    if (typeof(data_sheet_values[target_id]) == "undefined") {
        update_data_sheet_value(target_id, 0, false, "", false)
        // data_sheet_values[target_id] = 0
    }
    event.target.value = data_sheet_values[target_id]
    // Selects the whole of the input for easier editing
    event.target.select()
}

/**
 * Creates a new input based on given values
 * @param {string} id The id that will be used as the id for the input
 * @param {string} [name=id] The name that will be used for the input name
 * @param {string} [type="text"] Type specifies what the input box's type will be
 * @param {(string|float)} [value=0] Value decides what the default value for the input will be set to
 * @param {boolean} [format=true] Format decides whether to format the value or not
 * @param {string} [format_type="float"] Format_type is the format that will be used with the format_value formula
*/
function create_input(id, name=id, type="text", value=0, format=true, format_type="float") {
    let input = document.createElement("input")
    input.type = type
    input.id = id
    input.name = name

    if (format) {
        input.value = format_value(value, format_type)
    }
    else {
        input.value = value
    }

    return input
}

/**
 * Creates a label to be used with the currency input box
 * @returns {Element} A label that has a right aligned dollar sign
 */
function create_currency_label() {
    let label = document.createElement("label")
    label.textContent = "$"
    label.setAttribute("align", "right")

    return label
}

/**
 * 
 * @param {string} id The id to be used for finding the source id
 * @returns Returns a string for the id one level down from the given one (ie. source_id => source)
 */
function get_source_id(id, iterations=1) {
    let new_id = id

    for (let i = 0; i < iterations; i++) {
        new_id = new_id.substring(0, new_id.lastIndexOf("_"))
    }

    return new_id
}

/**
 * Gets the last part of an id
 * @param {string} id 
 * @returns {string} the last part of an id, ie. "test_string" would return "string"
 */
function get_original_id(id) {
    return id.substring(id.lastIndexOf("_") + 1)
}

/**
 * Creates a div container which holds different elements based on the parameters set here
 * @param {string} selector The combination of section_id and subsection_id. This is where the div will be appended. ie. "monthly_overhead_inputs" 
 * @param {string} new_id The new id for the element which holds a value in it. The input box for instance
 * @param {string} button_id The id for the New Input button. If this is given, the element will be added on before this instead of at the end of the container
 * @param {string} user_interaction The user_interaction, ie. "input"
 * @param {string} label_content The name for the initial label, ie. "Rent"
 * @param {float} value The value inside of the input box
 * @param {boolean} show_fixed_box Shows the box which allows the user to select Fixed or not
 * @param {boolean} default_fixed_value The default fixed value which applies whether or not the fixed box is shown
 * @param {string} format Format which applies to the value, ie. "float"
 * @param {string} allow_label_editing Allows the display label to be edited
 * @param {string} allow_removal Shows a removal button which will delete the div if clicked
 * @param {float} material_count The number of a material if the user_interaction is "material"
 */
function add_input_div(selector, new_id="", button_id="", user_interaction="", label_content="Misc", value=0, show_fixed_box=false, default_fixed_value=true, format="", allow_label_editing="", allow_removal="", material_count=0) {
    let section_id = get_source_id(selector)
    let subsection_id = get_original_id(selector)

    if (user_interaction == "") {
        user_interaction = get_user_interaction(section_id, subsection_id)
    }

    if (allow_label_editing == "") {
        if ("allow_label_editing" in data_sheet_variables_dict[section_id][subsection_id]) {
            allow_label_editing = data_sheet_variables_dict[section_id][subsection_id]["allow_label_editing"]
            if (typeof allow_label_editing != "boolean") {
                if (allow_label_editing) {
                    allow_label_editing = true
                }
                else {
                    allow_label_editing = false
                }
            }
        }
        else {
            allow_label_editing = false
        }
    }

    if (allow_removal == "") {
        if ("allow_removal" in data_sheet_variables_dict[section_id][subsection_id]) {
            allow_removal = data_sheet_variables_dict[section_id][subsection_id]["allow_removal"]
            if (typeof(allow_removal) != "boolean") {
                if (allow_label_editing) {
                    allow_removal = true
                }
                else {
                    allow_removal = false
                }
            }
        }
        else {
            allow_removal = false
        }
    }
    else if (allow_label_editing) {
        allow_removal = true
    }

    if (format == "") {
        if ("format" in data_sheet_variables_dict[section_id][subsection_id]) {
            format = data_sheet_variables_dict[section_id][subsection_id]["format"]
        }
        else {
            format = "float"
        }
    }

    let div = document.createElement("div")

    let newid = ""
    if (new_id != "") {
        newid = new_id
    }
    else {
        newid = "new_input_" + num_additional_inputs
    }

    let label = document.createElement("label")
    label.for = newid

    if (allow_label_editing) {
        label.id = newid + "_label"
    }

    label.textContent = label_content
    div.appendChild(label)

    // if (user_interaction == "input") {
    //     if (format == "float") {
    //         let curr_label = create_currency_label()
    //         div.appendChild(curr_label)
    //     }
    // }

    if (user_interaction != "output") {

        if (user_interaction == "material") {
            let input_count = create_input(newid + "_count", newid + "_count", "text", material_count, true, "int")
            div.appendChild(input_count)

            update_data_sheet_value(newid + "_count", material_count, false, "", false)
        }
        
        if (user_interaction == "input" || user_interaction == "material") {

            if (format == "float") {
                let curr_label = create_currency_label()
                div.appendChild(curr_label)
            }

            let input = create_input(newid, newid, "text", value, true, format)
            div.appendChild(input)


            if (new_id == "") {
                additional_inputs.push(newid)
                num_additional_inputs += 1
            }
            update_data_sheet_value(newid, value, false, "", false)
        }
        
        if (user_interaction == "material") {
            if (project_type in section_values[section_id][subsection_id]) {
                if (!section_values[section_id][subsection_id][project_type].includes(newid)) {
                    section_values[section_id][subsection_id][project_type].push(newid)
                }
            }
            else {
                section_values[section_id][subsection_id][project_type] = []
                if (!section_values[section_id][subsection_id][project_type].includes(newid)) {
                    section_values[section_id][subsection_id][project_type].push(newid)
                }            
            }
        }
        else {
            if (!section_values[section_id][subsection_id].includes(newid)) {
                section_values[section_id][subsection_id].push(newid)
            }
        }
        
        if (user_interaction == "input") {
            data_sheet_variables_dict[section_id][subsection_id]["display_values"][newid] = {
                "display_name": label_content,
                "show_fixed_box": show_fixed_box,
                "default_fixed_value": default_fixed_value,
                "default_value": value,
                "user_interaction": "input",
                "format": format
            }
            update_data_dict_cookie()
        }
        else if (user_interaction == "material") {
            data_sheet_variables_dict[section_id][subsection_id]["display_values"]["materials"]["default_values"][project_type][newid] = [
                label_content,
                material_count,
                value
            ]
            update_data_dict_cookie()
        }
        
        if (user_interaction == "selectbox") {
            let select_box = document.createElement("select")
            select_box.id = newid
    
            if ("options" in data_sheet_variables_dict[section_id][subsection_id]["display_values"][newid]) {
                for (let option_key in data_sheet_variables_dict[section_id][subsection_id]["display_values"][newid]["options"]) {
                    let option_elem = document.createElement("option")
                    option_elem.value = option_key
                    option_elem.textContent = data_sheet_variables_dict[section_id][subsection_id]["display_values"][newid]["options"][option_key]
                    select_box.appendChild(option_elem)
                }
            }
            
            if ("default_value" in data_sheet_variables_dict[section_id][subsection_id]["display_values"][newid]) {
                select_box.value = data_sheet_variables_dict[section_id][subsection_id]["display_values"][newid]["default_value"]
                update_project_type("", section_id, subsection_id, newid, select_box.value)
            }
            else {
                select_box.value = "small"
            }

            div.appendChild(select_box)
            document.querySelector("#" + selector).appendChild(div)
            
            let data = {
                "user_interaction_temp" : user_interaction,
                "show_fixed_box_temp" : show_fixed_box,
                "default_fixed_value" : default_fixed_value,
                "format_temp" : format,
                "allow_label_editing_temp" : allow_label_editing,
                "allow_removal_temp" : allow_removal
            }
            
            add_query_on_input(select_box.id, "input", update_project_type)
            add_query_on_input(select_box.id, "input", update_materials, data)
            add_query_on_input(select_box.id, "input", update_outputs)
        }

        if (show_fixed_box) {
            add_fixed_box(newid, div, section_id, subsection_id, "Fixed:")
        }
    
        if (allow_removal) {
            let button = create_removal_button(newid)
            div.append(button)
        }
    
        if (button_id != "") {
            document.querySelector("#" + selector).insertBefore(div, document.querySelector("#" + button_id))
        }
        else {
            document.querySelector("#" + selector).appendChild(div)
        }
        
        if (user_interaction == "input" || user_interaction == "material") {
            add_query_on_input(newid, "blur", set_event_target_currency, {"format" : format})
            add_query_on_input(newid, "blur", update_outputs)
            add_query_on_input(newid, "input", restrict_input)
            add_query_on_input(newid, "focus", focus_input)
        
            if (user_interaction == "material") {
                add_query_on_input(newid + "_count", "blur", set_event_target_currency, {"format" : "int"})
                add_query_on_input(newid + "_count", "blur", update_outputs)
                add_query_on_input(newid + "_count", "input", restrict_input)
                add_query_on_input(newid + "_count", "focus", focus_input)
            }
        }
    
        if (show_fixed_box) {
            add_query_on_change(newid + "_fixed", fixed_box_change)
        }
    }
    else if (user_interaction == "output") {
        let output_label = document.createElement("label")
            output_label.id = newid

            div.appendChild(output_label)
            document.querySelector("#" + selector).appendChild(div)
    }
    else {
        document.querySelector("#" + selector).appendChild(div)
    }
    
    if (allow_label_editing) {
        set_label_editable(newid + "_label", div)
    }
}

/**
 * Adds a new input onto the end of a selector, moving the button to the end of that section
 * @param {string} selector The selector to add the new input onto
 * @param {string} button_id The button id so that the new input div can be inserted before the button
 * @param {string} default_display_name Default display name for new values
 * @param {boolean} show_fixed_box Shows the box which can be selected or not for fixed values
 */
function add_input_div_from_button(selector, button_id, default_display_name="Misc", show_fixed_box=false) {
    add_input_div(selector, "", button_id, "", default_display_name, 0, show_fixed_box)
}

/**
 * Adds the new elements onto the element id one step up from where the button is
 * This is used with the New Input Button
 * @param {object} event 
 */
function add_new_elements_from_input_button(event) {
    let selector = event.composedPath()[1].id

    let section_id = get_source_id(selector)
    let subsection_id = get_original_id(selector)

    let show_fixed_box = false

    let user_interaction = get_user_interaction(section_id, subsection_id, "input")

    if (user_interaction == "input") {
        show_fixed_box = true
    }

    let display_name = "Misc"
    if (user_interaction == "material") {
        display_name = "Material"
    }

    add_input_div_from_button(selector, event.target.id, display_name, show_fixed_box)

    // let button = document.querySelector("#" + event.path[0].id)

    // button.parentNode.appendChild(button)
}

/**
 * 
 * @param {string} orig_id The original id for the input
 * @param {Element} div The div element to add onto
 * @param {string} section The corresponding section value (ie. monthly_overhead)
 * @param {string} section_value The corresponding subsection value for the section (ie. inputs)
 * @param {string} [text="Fixed:"] The text to be added next to the fixed box
 */
function add_fixed_box(orig_id, div, section, section_value, text="Fixed:") {
    let fixed_label = document.createElement("label")
    fixed_label.for = orig_id + "_fixed"
    fixed_label.textContent = text

    let fixed_input = document.createElement("input")
    fixed_input.type = "checkbox"
    fixed_input.checked = data_sheet_variables_dict[section][section_value]["display_values"][orig_id]["default_fixed_value"]
    fixed_input.id = orig_id + "_fixed"
    fixed_input.name = orig_id

    div.appendChild(fixed_label)
    div.appendChild(fixed_input)
}

/**
 * Updates the data_sheet_variables_dict with the change that was made, updates outputs
 * @param {object} event The jquery event
 */
function fixed_box_change(event) {
    // Gets id information
    let source_id = get_source_id(event.target.id)
    let section_id = get_source_id(event.originalEvent.composedPath()[2].id)
    let subsection_id = get_original_id(event.originalEvent.composedPath()[2].id)

    data_sheet_variables_dict[section_id][subsection_id]["display_values"][source_id]["default_fixed_value"] = event.target.checked
    update_data_dict_cookie()
    update_outputs()
}

/**
 * 
 * @param {string} source_id id of the section, ie. rent
 * @returns {object} button element to remove the elements of the container that button is in
 */
function create_removal_button(source_id) {
    let button = document.createElement("button")
    button.type = "button"
    button.textContent = "X"
    button.id = source_id + "_removebutton"
    button.style.width = "25px"
    button.onclick = remove_elements

    return button
}

/**
 * Resets everything back to default by deleting all the children in the parent container, 
 * replacing that section with the corresponding original values
 * @param {object} event The event from jquery
 */
function reset(event) {
    let source_id = get_source_id(event.target.id)

    let source_element = document.querySelector("#data_sheet_variables")
    while (source_element.firstChild) {
        source_element.removeChild(source_element.firstChild)
    }
    
    if (source_id == "data_sheet_variables") {
        data_sheet_variables_dict = JSON.parse(JSON.stringify(data_sheet_variables_dict_original))
        update_data_dict_cookie()
        add_dict_elements("#data_sheet_variables", data_sheet_variables_dict_original)
        update_outputs()
    }
    else {
        let section = get_source_id(source_id)
        let section_value = get_original_id(source_id)
        data_sheet_variables_dict[section][section_value] = JSON.parse(JSON.stringify(data_sheet_variables_dict_original[section][section_value]))
        update_data_dict_cookie()
        add_dict_elements("#data_sheet_variables", data_sheet_variables_dict)
        update_outputs()
    }
}

/**
 * Creates a reset button with the id + _resetbutton as the id
 * @param {string} source_id The parent container id
 * @param {string} [text="Reset"] The text to be displayed on the button
 * @returns {object} Button for resetting objects
 */
function create_reset_button(source_id, text="Reset") {
    let button = document.createElement("button")
    button.type = "button"
    button.textContent = text
    button.id = source_id + "_resetbutton"
    button.style.width = "500px"
    button.onclick = reset

    return button
}

/**
 * Removes the elements in the given parent container in the event
 * @param {object} event the jquery event
 */
function remove_elements(event) {
    // Gets id information
    let source_id = get_source_id(event.target.id)
    let section_id = get_source_id(event.composedPath()[2].id)
    let subsection_id = get_original_id(event.composedPath()[2].id)

    let user_interaction = get_user_interaction(section_id, subsection_id)

    // Deletes the information from the corresponding global variables
    if (user_interaction == "material") {
        // let project_type = project_type

        delete data_sheet_values[source_id]
        delete data_sheet_values[source_id + "_count"]
        
        section_values[section_id][subsection_id][project_type].splice(section_values[section_id][subsection_id][project_type].indexOf(source_id), 1)
        
        delete data_sheet_variables_dict[section_id][subsection_id]["display_values"]["materials"]["default_values"][project_type][source_id]
        update_data_dict_cookie()
        
        if (additional_inputs.includes(source_id)) {
            additional_inputs.splice(additional_inputs.indexOf(source_id), 1)
        }
        if (additional_inputs.includes(source_id + "_count")) {
            additional_inputs.splice(additional_inputs.indexOf(source_id + "_count"), 1)
        }
    }
    else {
        delete data_sheet_values[source_id]
        section_values[section_id][subsection_id].splice(section_values[section_id][subsection_id].indexOf(source_id), 1)
        delete data_sheet_variables_dict[section_id][subsection_id]["display_values"][source_id]
        update_data_dict_cookie()
        if (additional_inputs.includes(source_id)) {
            additional_inputs.splice(additional_inputs.indexOf(source_id), 1)
        }
    }

    // Updates outputs
    update_outputs()

    // Removes the parent container (a div in this case)
    event.target.parentNode.remove()
}

/**
 * Adds new elements to a given element based on the data_sheet_variables formatting through json
 * @param {string} selector The id of the element you want to add the new elements on top of
 * @param {object} dict The object that contains the information for each new element
 */
function add_dict_elements(selector, dict) {
    // Runs through every section in the object (ex. Monthly Overhead, Labor Burden, Annual Profit & Owner Salary, etc.)
    for (let section in dict) {
        section_values[section] = {}

        // Runs through each of the section values (ex. display_name, inputs, outputs)
        for (let section_value in dict[section]) {
            if (section_value == "display_name") {
                // Creates a new element for the section name (ex. Monthly Overhead)
                let section_header = document.createElement("h2")
                // Updates the text content to include the display version of that item
                section_header.textContent = dict[section]["display_name"]
                // Adds the element to the selector element
                document.querySelector(selector).appendChild(section_header)
            }

            else if ("display_name" in dict[section][section_value]) {
                let section_value_header = document.createElement("h3")
                section_value_header.textContent = dict[section][section_value]["display_name"]
                document.querySelector(selector).appendChild(section_value_header)
            }

            if (section_value != "display_name") {
                
                let user_interaction = get_user_interaction(section, section_value, "output")

                let show_fixed_box = false

                if ("show_fixed_box" in dict[section][section_value]) {
                    show_fixed_box = dict[section][section_value]["show_fixed_box"]
                    if (typeof(show_fixed_box) != "boolean") {
                        if (show_fixed_box) {
                            show_fixed_box = true
                        }
                        else {
                            show_fixed_box = false
                        }
                    }
                }

                let format = "float"

                if ("format" in dict[section][section_value]) {
                    format = dict[section][section_value]["format"]
                }

                let allow_label_editing = false

                if ("allow_label_editing" in dict[section][section_value]) {
                    allow_label_editing = dict[section][section_value]["allow_label_editing"]
                    if (typeof allow_label_editing != "boolean") {
                        allow_label_editing = false
                    }
                }

                let allow_removal = false

                if ("allow_removal" in dict[section][section_value]) {
                    allow_removal = dict[section][section_value]["allow_removal"]
                    if (typeof(allow_removal) != "boolean") {
                        if (allow_label_editing) {
                            allow_removal = true
                        }
                        else {
                            allow_removal = false
                        }
                    }
                }
                else if (allow_label_editing) {
                    allow_removal = true
                }

                let allow_additional_input_values = false
                if ("allow_additional_input_values" in dict[section][section_value]) {
                    if (dict[section][section_value]["allow_additional_input_values"]) {
                        allow_additional_input_values = true
                    }
                }

                let allow_reset = false
                if ("allow_reset" in dict[section][section_value]) {
                    if (dict[section][section_value]["allow_reset"] == true) {
                        allow_reset = true
                    }
                }

                section_values[section][section_value] = []

                let section_value_article = document.createElement("article")
                let article_id = section + "_" + section_value
                section_value_article.id = article_id
                document.querySelector(selector).appendChild(section_value_article)
            
                for (let key in dict[section][section_value]["display_values"]) {

                    let user_interaction_temp = user_interaction
                    if ("user_interaction" in dict[section][section_value]["display_values"][key]) {
                        user_interaction_temp = dict[section][section_value]["display_values"][key]["user_interaction"]
                    }
                    
                    let display_name = "Misc"
                    // if (user_interaction == "material") {
                    //     display_name = "Material"
                    // }
                    if ("display_name" in dict[section][section_value]["display_values"][key]) {
                        display_name = dict[section][section_value]["display_values"][key]["display_name"]
                    }
                    let value = 0
                    if ("default_value" in dict[section][section_value]["display_values"][key]) {
                        value = dict[section][section_value]["display_values"][key]["default_value"]
                    }


                    let show_fixed_box_temp = show_fixed_box
                    if ("show_fixed_box" in dict[section][section_value]["display_values"][key]) {
                        show_fixed_box_temp = dict[section][section_value]["display_values"][key]["show_fixed_box"]
                        if (typeof show_fixed_box_temp != "boolean") {
                            show_fixed_box_temp = show_fixed_box
                        }
                    }
                    

                    let default_fixed_value = false
                    if ("default_fixed_value" in dict[section][section_value]["display_values"][key]) {
                        default_fixed_value = dict[section][section_value]["display_values"][key]["default_fixed_value"]
                    }

                    let format_temp = format
                    if ("format" in dict[section][section_value]["display_values"][key]) {
                        format_temp = dict[section][section_value]["display_values"][key]["format"]
                    }
                    
                    let allow_label_editing_temp = allow_label_editing
                    if ("allow_label_editing" in dict[section][section_value]["display_values"][key]) {
                        allow_label_editing_temp = dict[section][section_value]["display_values"][key]["allow_label_editing"]
                        if (typeof(allow_label_editing_temp) != "boolean") {
                            allow_label_editing_temp = allow_label_editing
                        }
                    }
                    
                    let allow_removal_temp = allow_removal
                    if ("allow_removal" in dict[section][section_value]["display_values"][key]) {
                        allow_removal_temp = dict[section][section_value]["display_values"][key]["allow_removal"]
                        if (typeof(allow_removal_temp) != "boolean") {
                            allow_removal_temp = allow_removal
                        }
                    }
                    
                    if (user_interaction_temp == "material") {

                        let data = {data : {
                            "user_interaction_temp" : user_interaction_temp,
                            "show_fixed_box_temp" : show_fixed_box_temp,
                            "default_fixed_value" : default_fixed_value,
                            "format_temp" : format_temp,
                            "allow_label_editing_temp" : allow_label_editing_temp,
                            "allow_removal_temp" : allow_removal_temp
                        }}

                        update_materials(data)
                    }

                    else {
                        add_input_div(
                            article_id, 
                            key, 
                            "",
                            user_interaction_temp, 
                            display_name, 
                            value, 
                            show_fixed_box_temp, 
                            default_fixed_value, 
                            format_temp, 
                            allow_label_editing_temp, 
                            allow_removal_temp)
                    }
                }
                if (allow_additional_input_values) {
                    let button = document.createElement("button")
                    button.type = "button"
                    button.textContent = "New Input"
                    button.id = section + "_" + section_value + "_button"
                    button.style.width = "100px"
                    button.onclick = add_new_elements_from_input_button
    
                    document.querySelector("#" + section + "_" + section_value).appendChild(button)
                }
    
                if (allow_reset) {
                    let button = create_reset_button(section + "_" + section_value, "Reset Section to Default")
                    document.querySelector("#" + section + "_" + section_value).appendChild(button)
                }
            }
        }
    }
    let button = create_reset_button("data_sheet_variables", "Reset to Default")
    document.querySelector("#data_sheet_variables").appendChild(button)
}

/**
 * Runs each of the update functions for updating outputs
 * @param {object} event The event given from jquery
 */
function update_outputs(event=[]) {

    let func_list = [
        update_monthly_overhead_outputs,
        update_labor_burden_outputs,
        update_ann_profit_owner_sal_outputs,
        update_annual_roofing_days_outputs,
        update_daily_costs_outputs,
        update_labor_costs_outputs,
        update_materials_outputs,
        update_bid_percentage_markup_outputs,
        update_materials_labor_outputs,
        update_savage_estimating_outputs
    ]
    
    if ("data" in event) {
        let section_id = get_source_id(event.originalEvent.composedPath()[2].id)
        let subsection_id = get_original_id(event.originalEvent.composedPath()[2].id)

        if (section_id == "annual_roofing_days") {
            if (subsection_id == "inputs") {
                data_sheet_variables_dict["annual_roofing_days"]["outputs"]["display_values"]["total_roofing_days"]["total_up_months"] = true
                update_data_dict_cookie()
            }
            else if (subsection_id == "outputs") {
                data_sheet_variables_dict["annual_roofing_days"]["outputs"]["display_values"]["total_roofing_days"]["total_up_months"] = false
                update_data_dict_cookie()
            }
        }
    }

    if (typeof event.data == "object") {
        if ("exclude_list" in event.data) {
            func_list = func_list.filter(func => !event.data["exclude_list"].includes(func))
        }
    }

    for (let func of func_list) {
        func()
    }
    // update_monthly_overhead_outputs()
    // update_labor_burden_outputs()
    // update_ann_profit_owner_sal_outputs()
    // update_annual_roofing_days_outputs()
    // update_daily_costs_outputs()
}

function update_monthly_overhead_outputs() {
    let monthly_overhead_fixed_sum = 0
    let monthly_overhead_variable_sum = 0

    for (let key of section_values["monthly_overhead"]["inputs"]) {
        let fixed_input = document.querySelector("#" + key + "_fixed")
        if (fixed_input) {
            if (fixed_input.checked) {
                monthly_overhead_fixed_sum += data_sheet_values[key]
            }
            else {
                monthly_overhead_variable_sum += data_sheet_values[key]
            }
        }
        else if (data_sheet_variables_dict["monthly_overhead"]["inputs"]["display_values"][key]["default_fixed_value"]) {
            monthly_overhead_fixed_sum += data_sheet_values[key]
        }
        else {
            monthly_overhead_variable_sum += data_sheet_values[key]
        }
    }

    update_data_sheet_value("est_monthly_expenses_fixed", monthly_overhead_fixed_sum, true, format_value(monthly_overhead_fixed_sum, "curr"), false)
    update_data_sheet_value("est_monthly_expenses_variable", monthly_overhead_variable_sum, true, format_value(monthly_overhead_variable_sum, "curr"), false)
    
    let annual_expenses_fixed = data_sheet_values["est_monthly_expenses_fixed"] * 12
    update_data_sheet_value("est_annual_expenses_fixed", annual_expenses_fixed, true, format_value(annual_expenses_fixed, "curr"), false)
    
    let annual_expenses_variable = data_sheet_values["est_monthly_expenses_variable"] * 12
    update_data_sheet_value("est_annual_expenses_variable", annual_expenses_variable, true, format_value(annual_expenses_variable, "curr"), false)
    
    let total_annual_expenses = annual_expenses_variable + annual_expenses_fixed
    update_data_sheet_value("est_total_annual_expenses", total_annual_expenses, true, format_value(total_annual_expenses, "curr"), false)
}

function update_labor_burden_outputs() {
    let fica = data_sheet_values["hourly_rate"] * 0.0765
    update_data_sheet_value("fica_rate", fica, true, format_value(fica, "curr"), false)
    
    let futa = data_sheet_values["hourly_rate"] * 0.06
    update_data_sheet_value("futa_rate", futa, true, format_value(futa, "curr"), false)
    
    let suta = data_sheet_values["hourly_rate"] * 0.03
    update_data_sheet_value("suta_rate", suta, true, format_value(suta, "curr"), false)
    
    let liability = data_sheet_values["hourly_rate"] * (4/1000)
    update_data_sheet_value("liability_insurance", liability, true, format_value(liability, "curr"), false)
    
    let workers_comp = data_sheet_values["hourly_rate"] * (15/100)
    update_data_sheet_value("workers_comp", workers_comp, true, format_value(workers_comp, "curr"), false)
    
    let total_hourly_cost = data_sheet_values["hourly_rate"] + fica + futa + suta + liability + workers_comp
    update_data_sheet_value("total_hourly_cost", total_hourly_cost, true, format_value(total_hourly_cost, "curr"), false)
    
    let tax_burden = total_hourly_cost - data_sheet_values["hourly_rate"]
    update_data_sheet_value("tax_burden", tax_burden, true, format_value(tax_burden, "curr"), false)
}

function update_ann_profit_owner_sal_outputs() {
    let profit_target = 0
    if (data_sheet_values["total_roofing_days"] != 0 && data_sheet_values["total_roofing_days"] !== undefined) {
        profit_target = data_sheet_values["annual_profit"] / data_sheet_values["total_roofing_days"]
    }

    update_data_sheet_value("daily_profit_target", profit_target, true, format_value(profit_target, "curr"), false)
}

function update_annual_roofing_days_outputs() {
    if (data_sheet_variables_dict["annual_roofing_days"]["outputs"]["display_values"]["total_roofing_days"]["total_up_months"]) {
        let total_roofing_days = 0
        for (let key of section_values["annual_roofing_days"]["inputs"]) {
            total_roofing_days += data_sheet_values[key]
        }
        update_data_sheet_value("total_roofing_days", total_roofing_days, true, format_value(total_roofing_days, "int"), false)
    }
}

function update_daily_costs_outputs() {
    let daily_overhead_cost = 0
    if (data_sheet_values["total_roofing_days"] != 0 && data_sheet_values["total_roofing_days"] !== undefined) {
        daily_overhead_cost = data_sheet_values["est_total_annual_expenses"] / data_sheet_values["total_roofing_days"]
    }

    update_data_sheet_value("daily_overhead_cost", daily_overhead_cost, true, format_value(daily_overhead_cost, "curr"), false)

    let daily_crew_labor_cost = data_sheet_values["total_hourly_cost"] * data_sheet_values["num_workers"] * 8
    update_data_sheet_value("daily_crew_labor_cost", daily_crew_labor_cost, true, format_value(daily_crew_labor_cost, "curr"), false)

    let daily_profit_target = data_sheet_values["daily_profit_target"]
    update_data_sheet_value("daily_cost_profit_target", daily_profit_target, true, format_value(daily_profit_target, "curr"), false)

    let daily_cost_total = daily_overhead_cost + daily_crew_labor_cost + daily_profit_target
    update_data_sheet_value("daily_cost_total", daily_cost_total, true, format_value(daily_cost_total, "curr"), false)
}

function update_labor_costs_outputs() {
    let total_labor_cost = data_sheet_values["total_days"] * data_sheet_values["daily_crew_labor_cost"]
    update_data_sheet_value("total_labor_cost", total_labor_cost, true, format_value(total_labor_cost, "float"), false)
}

function update_materials_outputs() {
    let material_cost_sum = 0
    for (let key of section_values["materials_header"]["inputs"][project_type]) {
        material_cost_sum += data_sheet_values[key]
    }

    update_data_sheet_value("total_materials_cost", material_cost_sum, true, format_value(material_cost_sum, "curr"), false)
}

function update_bid_percentage_markup_outputs() {

    let markup_cost = (data_sheet_values["total_materials_cost"] + data_sheet_values["total_labor_cost"]) * data_sheet_values["markup_perc"]
    update_data_sheet_value("markup_cost", markup_cost, true, format_value(markup_cost, "curr"), false)
    
    let material_labor_cost = data_sheet_values["total_labor_cost"] + data_sheet_values["total_materials_cost"]
    update_data_sheet_value("material_labor_cost", material_labor_cost, true, format_value(material_labor_cost, "curr"), false)

    let total_price_1 = data_sheet_values["markup_cost"] + data_sheet_values["total_labor_cost"] + data_sheet_values["total_materials_cost"]
    update_data_sheet_value("total_price_1", total_price_1, true, format_value(total_price_1, "curr"), false)

    let minus_overhead = 0
    if (project_type == "small" || project_type == "small_2") {
        minus_overhead = (data_sheet_values["daily_overhead_cost"] + data_sheet_values["daily_profit_target"]) * data_sheet_values["total_days"]
    }
    else {
        minus_overhead = data_sheet_values["daily_overhead_cost"] * data_sheet_values["total_days"]
    }
    update_data_sheet_value("minus_overhead", minus_overhead, true, format_value(minus_overhead, "curr"), false)

    let total_materials_cost_display = data_sheet_values["total_materials_cost"]
    update_data_sheet_value("total_materials_cost_display", total_materials_cost_display, true, format_value(total_materials_cost_display, "curr"), false)

    let total_labor_cost_display = data_sheet_values["total_labor_cost"]
    update_data_sheet_value("total_labor_cost_display", total_labor_cost_display, true, format_value(total_labor_cost_display, "curr"), false)

    let total_profit_1 = data_sheet_values["total_price_1"] - data_sheet_values["minus_overhead"] - data_sheet_values["total_materials_cost"] - data_sheet_values["total_labor_cost"]
    update_data_sheet_value("total_profit_1", total_profit_1, true, format_value(total_profit_1, "curr"), false)

    let daily_profit_1 = 0
    if (data_sheet_values["total_days"] != 0) {
        daily_profit_1 = data_sheet_values["total_profit_1"] / data_sheet_values["total_days"]
    }
    update_data_sheet_value("daily_profit_1", daily_profit_1, true, format_value(daily_profit_1, "curr"), false)

    let difference_daily_profit_goal_1 = data_sheet_values["daily_profit_1"] - data_sheet_values["daily_profit_target"]
    update_data_sheet_value("difference_daily_profit_goal_1", difference_daily_profit_goal_1, true, format_value(difference_daily_profit_goal_1, "curr"), false)

}

function update_materials_labor_outputs() {
    
    let material_x2 = data_sheet_values["total_materials_cost"] * 2
    update_data_sheet_value("material_x2", material_x2, true, format_value(material_x2, "curr"), false)
    
    let new_material = data_sheet_values["material_x2"] * 0.014
    update_data_sheet_value("new_material", new_material, true, format_value(new_material, "curr"), false)

    let total_price_2 = data_sheet_values["new_material"] + data_sheet_values["material_x2"]
    update_data_sheet_value("total_price_2", total_price_2, true, format_value(total_price_2, "curr"), false)

    let minus_overhead_display = data_sheet_values["minus_overhead"]
    update_data_sheet_value("minus_overhead_display", minus_overhead_display, true, format_value(minus_overhead_display, "curr"), false)

    let total_materials_cost_display_2 = data_sheet_values["total_materials_cost"]
    update_data_sheet_value("total_materials_cost_display_2", total_materials_cost_display_2, true, format_value(total_materials_cost_display_2, "curr"), false)

    let total_labor_cost_display_2 = data_sheet_values["total_labor_cost"]
    update_data_sheet_value("total_labor_cost_display_2", total_labor_cost_display_2, true, format_value(total_labor_cost_display_2, "curr"), false)

    let total_profit_2 = data_sheet_values["total_price_2"] - data_sheet_values["minus_overhead"] - data_sheet_values["total_materials_cost"] - data_sheet_values["total_labor_cost"]
    update_data_sheet_value("total_profit_2", total_profit_2, true, format_value(total_profit_2, "curr"), false)

    let daily_profit_2 = 0
    if (data_sheet_values["total_days"] != 0) {
        daily_profit_2 = data_sheet_values["total_profit_2"] / data_sheet_values["total_days"]
    }
    update_data_sheet_value("daily_profit_2", daily_profit_2, true, format_value(daily_profit_2, "curr"), false)

    let difference_daily_profit_goal_2 = data_sheet_values["daily_profit_2"] - data_sheet_values["daily_profit_target"]
    update_data_sheet_value("difference_daily_profit_goal_2", difference_daily_profit_goal_2, true, format_value(difference_daily_profit_goal_2, "curr"), false)

}

function update_savage_estimating_outputs() {

    let daily_work_cost = 0
    if (project_type == "small" || project_type == "large") {
        daily_work_cost = data_sheet_values["total_days"] * data_sheet_values["daily_cost_total"]
    }
    else {
        daily_work_cost = (((data_sheet_values["daily_overhead_cost"] + data_sheet_values["daily_profit_target"]) / 2) + data_sheet_values["daily_crew_labor_cost"]) * data_sheet_values["total_days"]
    }
    update_data_sheet_value("daily_work_cost", daily_work_cost, true, format_value(daily_work_cost, "curr"), false)
    
    let total_materials_cost_display_3 = data_sheet_values["total_materials_cost"]
    update_data_sheet_value("total_materials_cost_display_3", total_materials_cost_display_3, true, format_value(total_materials_cost_display_3, "curr"), false)

    let total_price = data_sheet_values["daily_work_cost"] + data_sheet_values["total_materials_cost"]
    update_data_sheet_value("total_price", total_price, true, format_value(total_price, "curr"), false)

    let minus_overhead_display_2 = 0
    if (project_type == "small" || project_type == "large") {
        minus_overhead_display_2 = data_sheet_values["minus_overhead"]
    }
    else if (project_type == "small_2") {
        minus_overhead_display_2 = ((data_sheet_values["daily_overhead_cost"] + data_sheet_values["daily_profit_target"]) / 2) * data_sheet_values["total_days"]
    }
    else {
        minus_overhead_display_2 = data_sheet_values["minus_overhead"] / 2
    }
    update_data_sheet_value("minus_overhead_display_2", minus_overhead_display_2, true, format_value(minus_overhead_display_2, "curr"), false)

    let total_materials_cost_display_4 = data_sheet_values["total_materials_cost"]
    update_data_sheet_value("total_materials_cost_display_4", total_materials_cost_display_4, true, format_value(total_materials_cost_display_4, "curr"), false)

    let total_labor_cost_display_3 = data_sheet_values["total_labor_cost"]
    update_data_sheet_value("total_labor_cost_display_3", total_labor_cost_display_3, true, format_value(total_labor_cost_display_3, "curr"), false)

    let total_profit = 0
    if (project_type == "large_2") {
        total_profit = data_sheet_values["total_days"] * (data_sheet_values["daily_profit_target"] / 2)
    }
    else {
        total_profit = data_sheet_values["total_days"] * data_sheet_values["daily_profit_target"]
    }
    update_data_sheet_value("total_profit", total_profit, true, format_value(total_profit, "curr"), false)

    let daily_profit_target_display = 0
    if (project_type == "large_2") {
        daily_profit_target_display = data_sheet_values["daily_profit_target"] / 2
    }
    else {
        daily_profit_target_display = data_sheet_values["daily_profit_target"]
    }
    update_data_sheet_value("daily_profit_target_display", daily_profit_target_display, true, format_value(daily_profit_target_display, "curr"), false)

    let difference_daily_profit_goal_3 = 0
    update_data_sheet_value("difference_daily_profit_goal_3", difference_daily_profit_goal_3, true, format_value(difference_daily_profit_goal_3, "curr"), false)

}

function main() {
    // Gets the json file and converts it to an array which is used as an argument in the add_dict_elements function
    fetch("./data/data_sheet_variables.json")
    .then(response => {
        return response.json()
    })
    .then(data => {
        data_sheet_variables_dict_original = data[0]

        data_sheet_variables_dict = get_data_dict_cookie()
        if (data_sheet_variables_dict != "") {
            data_sheet_variables_dict = JSON.parse(data_sheet_variables_dict)
        }
        else {
            data_sheet_variables_dict = JSON.parse(JSON.stringify(data[0]))
        }

        add_dict_elements("#data_sheet_variables", data_sheet_variables_dict)

        // Finds the largest new_input value and sets num_additional_inputs to it
        // since IDs have to be unique
        let largest_num_additional_inputs = 0
        for (let value in data_sheet_values) {
            if (get_source_id(value) == "new_input") {
                let new_input_num = parseInt(get_original_id(value))
                if (new_input_num + 1 > largest_num_additional_inputs) {
                    largest_num_additional_inputs = new_input_num + 1
                }
            }
        }

        if (largest_num_additional_inputs > num_additional_inputs) {
            num_additional_inputs = largest_num_additional_inputs
        }

        update_outputs()
    })
}

main()