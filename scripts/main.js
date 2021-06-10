// Add default values to json (if Shawn wants that)
// Implement default values for new inputs

// Separate add_dict_elements into smaller functions
// Allow for additional items to be added onto the monthly overhead and materials (this may involve removing the misc values)
// Allow current display values in monthly overhead and materials to be changed
// Change total roofing days to also allow for a total to be set (hiding the monthly values if the total is set)
// Fica, futa, suta, gen liability, workers comp into output values instead of input
// Materials should default to zero, qty, name, and cost should all still be inputs

var data_sheet_values = {}
var section_values = {}
var data_sheet_variables_dict = {}

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
 * Restricts the input of the target object based on if it is a valid number, if it isn't, it sets the value to the corresponding id value in the data_sheet_values object
 * @param {object} event The event given from jQuery that can be used to find information on the element
 */
function restrict_input(event) {
    let value = event.target.value
    let target_id = event.target.id

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
            data_sheet_values[target_id] = parseFloat(value).toFixed(2)
        }
        else if(value == "") {
            data_sheet_values[target_id] = value
        }
        else {
            data_sheet_values[target_id] = parseFloat(value)
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
 * @param {string} [format="float"] Format is the format that will be used with the format_value formula. Defaults to "curr"
 */
function create_input(id, name=id, type="text", value=0, format="float") {
    let input = document.createElement("input")
    input.type = type
    input.id = id
    input.name = name
    input.value = format_value(value, format)
    
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
 * Adds new elements to a given element based on the data_sheet_variables formatting through json
 * @param {string} selector The id of the element you want to add the new elements on top of
 * @param {object} dict The object that contains the information for each new element
 * @param {object} value_dict The object that contains only the raw values for each element id
 */
function add_dict_elements(selector, dict, value_dict) {
    // Runs through every section in the object (ex. Monthly Overhead, Labor Burden, Annual Profit & Owner Salary, etc.)
    for (const section in dict) {
        section_values[section] = {}

        // Runs through each of the section values (ex. display_name, inputs, outputs)
        for (const section_value in dict[section]) {
            if (section_value != "display_name") {
                section_values[section][section_value] = []
            }

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

            let section_value_article = document.createElement("article")
            let article_id = section + "_" + section_value
            section_value_article.id = article_id
            document.querySelector(selector).appendChild(section_value_article)

            for (const key in dict[section][section_value]["display_values"]) {
                section_values[section][section_value].push(key)

                let div = document.createElement("div")

                let label = document.createElement("label")
                label.for = key
                label.textContent = dict[section][section_value]["display_values"][key]["display_name"] + ":"
                div.appendChild(label)
                
                if (dict[section][section_value]["display_values"][key]["user_interaction"] == "input") {
                    if ("default_value" in dict[section][section_value]["display_values"][key]){
                        value_dict[key] = dict[section][section_value]["display_values"][key]["default_value"]
                    }

                    else {
                        value_dict[key] = 0
                    }
                    
                    if ("format" in dict[section][section_value]["display_values"][key]) {
                        let input
                        let curr_label
                        switch (dict[section][section_value]["display_values"][key]["format"]) {
                            case "curr":
                                input = create_input(key, key, "text", value_dict[key], "float")
                                curr_label = create_currency_label()
                                div.appendChild(curr_label)
                                div.appendChild(input)
                                break

                            case "int":
                                input = create_input(key, key, "text", value_dict[key], "int")
                                div.appendChild(input)
                                break

                            case "perc":
                                input = create_input(key, key, "text", value_dict[key], "perc")
                                div.appendChild(input)
                                break

                            default:
                                input = create_input(key, key, "text", value_dict[key], "float")
                                curr_label = create_currency_label()
                                div.appendChild(curr_label)
                                div.appendChild(input)
                        }
                    }
                    else {
                        let input = create_input(key, key, "text", value_dict[key], "float")
                        let curr_label = create_currency_label()
                        div.appendChild(curr_label)
                        div.appendChild(input)
                    }
                    
                    if ("show_fixed_box" in dict[section][section_value]["display_values"][key]) {
                        if (dict[section][section_value]["display_values"][key]["show_fixed_box"]) {
                            let fixed_label = document.createElement("label")
                            fixed_label.for = key + "_fixed"
                            fixed_label.textContent = "Fixed:"

                            let fixed_input = document.createElement("input")
                            fixed_input.type = "checkbox"
                            fixed_input.checked = dict[section][section_value]["display_values"][key]["default_fixed_value"]
                            fixed_input.id = key + "_fixed"
                            fixed_input.name = key

                            div.appendChild(fixed_label)
                            div.appendChild(fixed_input)
                        }
                    }

                    document.querySelector("#" + article_id).appendChild(div)

                    // text input queries
                    add_query_on_input(key, "blur", set_event_target_currency)
                    add_query_on_input(key, "blur", update_outputs, dict)
                    add_query_on_input(key, "input", restrict_input)
                    add_query_on_input(key, "focus", focus_input)

                    if ("default_fixed_value" in dict[section][section_value]["display_values"][key]) {
                        add_query_on_change(key + "_fixed", update_outputs, dict)
                    }
                }

                else if (dict[section][section_value]["display_values"][key]["user_interaction"] == "output") {
                    output_label = document.createElement("label")
                    output_label.id = key + "_value"

                    div.appendChild(output_label)
                    document.querySelector("#" + article_id).appendChild(div)
                }

                else {
                    document.querySelector("#" + article_id).appendChild(div)
                }
            }
        }
    }
}

function update_outputs() {
    update_monthly_overhead_outputs()
}

function update_monthly_overhead_outputs() {
    let monthly_overhead_fixed_sum = 0
    let monthly_overhead_variable_sum = 0
    for (key of section_values["monthly_overhead"]["inputs"]) {
        fixed_input = document.querySelector("#" + key + "_fixed")
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

    document.querySelector("#est_monthly_expenses_fixed_value").textContent = format_value(monthly_overhead_fixed_sum)
    document.querySelector("#est_monthly_expenses_variable_value").textContent = format_value(monthly_overhead_variable_sum)
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
        data_sheet_variables_dict = data[0]
        add_dict_elements("#data_sheet_variables", data_sheet_variables_dict, data_sheet_values)
        update_outputs()
    })
}

main()