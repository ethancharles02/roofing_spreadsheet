// Add default values to json (if Shawn wants that)
// Implement default values for new inputs
// Add formatting for accounting values

var monthly_overhead_inputs = {}

function add_query_on_input(id, event, func){
    jQuery("#" + id).on(event, func)
}

function format_value_to_currency(value){
    return "$ " + parseFloat(value).toFixed(2)
}

function set_event_target_currency(event){
    let value = event.target.value
    if (jQuery.isNumeric(value)){
        event.target.value = format_value_to_currency(event.target.value)
    }
}

function restrict_input(event){
    let value = event.target.value
    let id = event.target.id

    if (!jQuery.isNumeric(value) && value != ""){
        event.target.value = monthly_overhead_inputs[id]
    }
    else{
        if (value.includes(".")){
            monthly_overhead_inputs[id] = parseFloat(value).toFixed(2)
        }
        else if(value == ""){
            monthly_overhead_inputs[id] = value
        }
        else{
            monthly_overhead_inputs[id] = parseFloat(value)
        }
    }
}

function focus_input(event){
    event.target.value = monthly_overhead_inputs[event.target.id]
    event.target.select()
}

function add_dict_elements(selector, dict, value_dict){
    for (const key in dict){
        value_dict[key] = ""
        let div = document.createElement("div")

        let label = document.createElement("label")
        label.for = key
        label.textContent = dict[key]["display_name"] + ":"

        let input = document.createElement("input")
        input.type = "text"
        input.id = key
        input.name = key

        div.appendChild(label)
        div.appendChild(input)

        if ("default_fixed_value" in dict[key]){
            let fixed_label = document.createElement("label")
            fixed_label.for = key + "_fixed"
            fixed_label.textContent = "Fixed:"

            let fixed_input = document.createElement("input")
            fixed_input.type = "checkbox"
            fixed_input.checked = dict[key]["default_fixed_value"]
            fixed_input.id = key + "_fixed"
            fixed_input.name = key

            div.appendChild(fixed_label)
            div.appendChild(fixed_input)
            
        }
        document.querySelector(selector).appendChild(div)

        add_query_on_input(key, "blur", set_event_target_currency)
        add_query_on_input(key, "input", restrict_input)
        add_query_on_input(key, "focus", focus_input)
    }
}

fetch("./data/monthly_overhead.json")
.then(response => {
    return response.json()
})
.then(data => add_dict_elements("#inputs_monthly_overhead", data[0], monthly_overhead_inputs))