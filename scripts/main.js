// To-Do:
// Fix Memory Leaks from reset buttons
// Add function docstrings

// Change total roofing days to also allow for a total to be set (hiding the monthly values if the total is set)
// Fica, futa, suta, gen liability, workers comp into output values instead of input
// Materials should default to zero, qty, name, and cost should all still be inputs
// Separate add_dict_elements into smaller functions
// Move removal button to a harder to click place or make a confirmation message

'use strict'

var data_sheet_values = {}
var section_values = {}
var data_sheet_variables_dict_original = {}
var data_sheet_variables_dict = {}
var additional_inputs = []
var num_additional_inputs = 0

/**
 * Adds a query to an input text box that will run the given function
 * @param {string} id The id of the input box (without the #)
 * @param {string} event The event that will trigger the function (ex. blur, input, focus)
 * @param {function} func The function that gets triggered
 */
function add_query_on_input(id, event, func) {
    // Adds a query onto the element with the given id
    jQuery("#" + id).on(event, func)
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
 * Formats a given value into a currency format, the value is expected to already be a valid number (string or float)
 * @param {(string|float)} value The value to be formatted
 * @param {string} [format="float"] The format to be used for the value, defaults to curr (currency), also accepts "int" and "perc"
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
            return "$ " + parseFloat(value).toFixed(2)
        case "int":
            return parseInt(value)
        case "perc":
            let perc_value = parseFloat(value)
            if (perc_value > 1){
                return perc_value + "%"
            }
            else {
                return perc_value * 100 + "%"
            }
        case "float":
            return parseFloat(value).toFixed(2)
        default:
            return "$ " + parseFloat(value).toFixed(2)
    }
}

/**
 * Sets the value of the clicked event to the currency formatted version
 * @param {object} event The event given from jQuery that can be used to find the value
 */
function set_event_target_currency(event) {
    let value = event.target.value
    // Checks if the string is a valid number
    if (jQuery.isNumeric(value)) {
        // Sets the value to the formatted version
        event.target.value = format_value(event.target.value)
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

    let section_id = get_source_id(event.originalEvent.path[2].id)
    let subsection_id = get_original_id(event.originalEvent.path[2].id)
    data_sheet_variables_dict[section_id][subsection_id]["display_values"][get_source_id(label_id)]["display_name"] = new_value

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

function update_data_sheet_value(id, new_value, update_dict = true, section_id = "", subsection_id = "") {
    data_sheet_values[id] = new_value

    if (update_dict) {
        data_sheet_variables_dict[section_id][subsection_id]["display_values"][id]["default_value"] = new_value
    }
}

/**
 * Restricts the input of the target object based on if it is a valid number, if it isn't, it sets the value to the corresponding id value in the data_sheet_values object
 * @param {object} event The event given from jQuery that can be used to find information on the element
 */
function restrict_input(event) {
    let value = event.target.value
    let target_id = event.target.id

    let section_id = get_source_id(event.originalEvent.path[2].id)
    let subsection_id = get_original_id(event.originalEvent.path[2].id)

    // If the input isn't a number and isn't an empty string, it reverts it to the previous value
    if (!jQuery.isNumeric(value) && value != "") {
        event.target.value = data_sheet_values[target_id]
    }
    // If it is a valid number or an empty string, updates the input values
    // If the value has a decimal in it, it is stored with the two decimals
    // If the value is an empty string, the input values only take that string
    // If the value is an int, it is simply stored as is
    else {
        if (value.includes(".")) {
            update_data_sheet_value(target_id, parseFloat(value).toFixed(2), true, section_id, subsection_id)
            // data_sheet_values[target_id] = parseFloat(value).toFixed(2)
        }
        else if(value == "") {
            update_data_sheet_value(target_id, 0, true, section_id, subsection_id)
            // data_sheet_values[target_id] = value
        }
        else {
            update_data_sheet_value(target_id, parseFloat(value), true, section_id, subsection_id)
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
        update_data_sheet_value(target_id, 0, false)
        // data_sheet_values[target_id] = 0
    }
    event.target.value = data_sheet_values[target_id]
    // Selects the whole of the input for easier editing
    event.target.select()
}

/**
 * Creates a new input based on given values
 * @param {string} id The id that will be used as the id for the input
 * @param {string} [name=id] The name that will be used for the input name, defaults to the id
 * @param {string} [type="text"] Type specifies what the input box's type will be. Defaults to "text"
 * @param {(string|float)} [value=0] Value decides what the default value for the input will be set to. Defaults to 0
 * @param {boolean} [format=true] Format decides whether to format the value or not
 * @param {string} [format_type="float"] Format_type is the format that will be used with the format_value formula. Defaults to "curr" 
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
 * 
 * @param {string} id 
 * @returns Returns the last part of an id, ie. "test_string" would return "string"
 */
function get_original_id(id) {
    return id.substring(id.lastIndexOf("_") + 1)
}

/**
 * Adds a new input onto the end of a selector, moving the button to the end of that section
 * @param {string} selector The selector to add the new input onto
 * @param {string} button_id The button id so that the new input div can be inserted before the button
 */
function add_input_div_from_button(selector, button_id) {

    let section_id = get_source_id(selector)
    let subsection_id = get_original_id(selector)

    let allow_label_editing = false
    if ("allow_label_editing" in data_sheet_variables_dict[section_id][subsection_id]) {
        if (data_sheet_variables_dict[section_id][subsection_id]["allow_label_editing"]) {
            allow_label_editing = true
        }
    }

    let allow_removal = false

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
    else if (allow_label_editing) {
        allow_removal = true
    }

    let div = document.createElement("div")

    let newid = "new_input_" + num_additional_inputs

    let label = document.createElement("label")
    label.for = newid

    if (allow_label_editing) {
        label.id = newid + "_label"
    }

    label.textContent = "Misc"
    div.appendChild(label)

    let curr_label = create_currency_label()
    div.appendChild(curr_label)

    let input = create_input(newid)
    div.appendChild(input)

    additional_inputs.push(newid)
    num_additional_inputs += 1
    update_data_sheet_value(newid, 0, false)
    // data_sheet_values[newid] = 0

    section_values[section_id][subsection_id].push(newid)
    data_sheet_variables_dict[section_id][subsection_id]["display_values"][newid] = {
        "display_name": "Misc",
        "show_fixed_box": true,
        "default_fixed_value": false,
        "user_interaction": "input"
    }

    add_fixed_box(newid, div, section_id, subsection_id, "Fixed:")

    if (allow_removal) {
        let button = create_removal_button(newid)
        div.append(button)
    }

    document.querySelector("#" + selector).insertBefore(div, document.querySelector("#" + button_id))

    add_query_on_input(newid, "blur", set_event_target_currency)
    add_query_on_input(newid, "blur", update_outputs, data_sheet_variables_dict)
    add_query_on_input(newid, "input", restrict_input)
    add_query_on_input(newid, "focus", focus_input)
    add_query_on_change(newid + "_fixed", fixed_box_change, data_sheet_variables_dict)
    
    if (allow_label_editing) {
        set_label_editable(newid + "_label", div)
    }
}

/**
 * Adds the new elements onto the element id one step up from where the button is
 * This is used with the New Input Button
 * @param {object} event 
 */
function add_new_elements_from_input_button(event) {
    let selector = event.path[1].id
    add_input_div_from_button(selector, event.target.id)

    // let button = document.querySelector("#" + event.path[0].id)

    // button.parentNode.appendChild(button)
}

/**
 * 
 * @param {string} orig_id The original id for the input
 * @param {Element} div The div element to add onto
 * @param {string} section The corresponding section value (ie. monthly_overhead)
 * @param {string} section_value The corresponding subsection value for the section (ie. inputs)
 * @param {string} text The text to be added next to the fixed box
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

function fixed_box_change(event) {
    // Gets id information
    let source_id = get_source_id(event.target.id)
    let section_id = get_source_id(event.originalEvent.path[2].id)
    let subsection_id = get_original_id(event.originalEvent.path[2].id)

    data_sheet_variables_dict[section_id][subsection_id]["display_values"][source_id]["default_fixed_value"] = event.target.checked

    update_outputs()
}

/**
 * 
 * @param {string} source_id id of the section, ie. rent
 * @returns button element to remove the elements of the container that button is in
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

function reset(event) {
    let source_id = get_source_id(event.target.id)

    let source_element = document.querySelector("#data_sheet_variables")
    while (source_element.firstChild) {
        source_element.removeChild(source_element.firstChild)
    }
    
    if (source_id == "data_sheet_variables") {
        data_sheet_variables_dict = JSON.parse(JSON.stringify(data_sheet_variables_dict_original))
        add_dict_elements("#data_sheet_variables", data_sheet_variables_dict_original)
        update_outputs()
    }
    else {
        let section = get_source_id(source_id)
        let section_value = get_original_id(source_id)
        data_sheet_variables_dict[section][section_value] = JSON.parse(JSON.stringify(data_sheet_variables_dict_original[section][section_value]))
        add_dict_elements("#data_sheet_variables", data_sheet_variables_dict)
        update_outputs()
    }
}

function create_reset_button(source_id, text) {
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
    let section_id = get_source_id(event.path[2].id)
    let subsection_id = get_original_id(event.path[2].id)

    // Deletes the information from the corresponding global variables
    delete data_sheet_values[source_id]
    section_values[section_id][subsection_id].splice(section_values[section_id][subsection_id].indexOf(source_id), 1)
    delete data_sheet_variables_dict[section_id][subsection_id]["display_values"][source_id]
    if (additional_inputs.includes(source_id)) {
        additional_inputs.splice(additional_inputs.indexOf(source_id), 1)
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

                let allow_label_editing = false

                if ("allow_label_editing" in dict[section][section_value]) {
                    if (dict[section][section_value]["allow_label_editing"]) {
                        allow_label_editing = true
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

                    section_values[section][section_value].push(key)

                    let div = document.createElement("div")

                    let label = document.createElement("label")

                    if (allow_label_editing_temp) {
                        label.id = key + "_label"
                    }

                    label.for = key
                    label.textContent = dict[section][section_value]["display_values"][key]["display_name"]
                    div.appendChild(label)

                    if (dict[section][section_value]["display_values"][key]["user_interaction"] == "input") {
                        if ("default_value" in dict[section][section_value]["display_values"][key]){
                            update_data_sheet_value(key, dict[section][section_value]["display_values"][key]["default_value"], false)
                            // data_sheet_values[key] = dict[section][section_value]["display_values"][key]["default_value"]
                        }

                        else {
                            update_data_sheet_value(key, 0, false)
                            // data_sheet_values[key] = 0
                        }
                        
                        if ("format" in dict[section][section_value]["display_values"][key]) {
                            let input
                            let curr_label
                            switch (dict[section][section_value]["display_values"][key]["format"]) {
                                case "curr":
                                    input = create_input(key, key, "text", data_sheet_values[key], true, "float")
                                    curr_label = create_currency_label()
                                    div.appendChild(curr_label)
                                    div.appendChild(input)
                                    break

                                case "int":
                                    input = create_input(key, key, "text", data_sheet_values[key], true, "int")
                                    div.appendChild(input)
                                    break

                                case "perc":
                                    input = create_input(key, key, "text", data_sheet_values[key], true, "perc")
                                    div.appendChild(input)
                                    break

                                default:
                                    input = create_input(key, key, "text", data_sheet_values[key], true, "float")
                                    curr_label = create_currency_label()
                                    div.appendChild(curr_label)
                                    div.appendChild(input)
                            }
                        }
                        else {
                            let input = create_input(key, key, "text", data_sheet_values[key], true, "float")
                            let curr_label = create_currency_label()
                            div.appendChild(curr_label)
                            div.appendChild(input)
                        }
                        
                        if ("show_fixed_box" in dict[section][section_value]["display_values"][key]) {
                            if (dict[section][section_value]["display_values"][key]["show_fixed_box"]) {
                                add_fixed_box(key, div, section, section_value, "Fixed:")
                            }
                        }

                        if (allow_removal_temp) {
                            let button = create_removal_button(key)
                            div.append(button)
                        }

                        document.querySelector("#" + article_id).appendChild(div)

                        // text input queries
                        add_query_on_input(key, "blur", set_event_target_currency)
                        add_query_on_input(key, "blur", update_outputs, dict)
                        add_query_on_input(key, "input", restrict_input)
                        add_query_on_input(key, "focus", focus_input)

                        if ("default_fixed_value" in dict[section][section_value]["display_values"][key]) {
                            add_query_on_change(key + "_fixed", fixed_box_change, dict)
                        }

                        if (allow_label_editing_temp) {
                            set_label_editable(key + "_label", div)
                        }
                    }

                    else if (dict[section][section_value]["display_values"][key]["user_interaction"] == "output") {
                        let output_label = document.createElement("label")
                        output_label.id = key + "_value"

                        div.appendChild(output_label)
                        document.querySelector("#" + article_id).appendChild(div)
                    }

                    else {
                        document.querySelector("#" + article_id).appendChild(div)
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
                    // console.log(section_value)
                    let button = create_reset_button(section + "_" + section_value, "Reset Section to Default")
                    document.querySelector("#" + section + "_" + section_value).appendChild(button)
                    // let button = document.createElement("button")
                    // button.type = "button"
                    // button.textContent = "New Input"
                    // button.id = section + "_" + section_value + "_button"
                    // button.style.width = "100px"
                    // button.onclick = add_new_elements_from_input_button
    
                    // document.querySelector("#" + section + "_" + section_value).appendChild(button)
                }
            }
        }
    }
    let button = create_reset_button("data_sheet_variables", "Reset to Default")
    document.querySelector("#data_sheet_variables").appendChild(button)
}

function update_outputs() {
    update_monthly_overhead_outputs()
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

    document.querySelector("#est_monthly_expenses_fixed_value").textContent = format_value(monthly_overhead_fixed_sum, "curr")
    document.querySelector("#est_monthly_expenses_variable_value").textContent = format_value(monthly_overhead_variable_sum, "curr")
    // document.querySelector("#est_annual_expenses_fixed_value").textContent =
    // document.querySelector("#est_annual_expenses_variable_value").textContent =
    // document.querySelector("#est_total_annual_expenses_value").textContent =
}

function main() {
    // Gets the json file and converts it to an array which is used as an argument in the add_dict_elements function
    fetch("./data/data_sheet_variables.json")
    .then(response => {
        return response.json()
    })
    .then(data => {
        data_sheet_variables_dict_original = data[0]
        data_sheet_variables_dict = JSON.parse(JSON.stringify(data[0]))
        add_dict_elements("#data_sheet_variables", data_sheet_variables_dict)
        update_outputs()
    })
}

main()