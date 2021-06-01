function add_dict_elements(selector, dict){
    for (const key in dict){
        // console.log([key, dict[key]])
        let div = document.createElement("div")

        let label = document.createElement("label")
        label.for = key
        label.textContent = dict[key]["display_name"] + ":"

        let input = document.createElement("input")
        input.type = "number"
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
    }
}

// document.querySelector("#inputs_monthly_overhead").appendChild(test_element)

fetch("./data/monthly_overhead.json")
.then(response => {
    return response.json()
})
.then(data => add_dict_elements("#inputs_monthly_overhead", data[0]))

// function add(number1, number2){
//     return number1 + number2
// }

// function addNumbers(){
//     return document.querySelector("#sum").value = add(parseFloat(document.querySelector("#addend1").value), parseFloat(document.querySelector("#addend2").value))
// }

// document.querySelector("#addNumbers").addEventListener("click", addNumbers)

// let subtract = function(number1, number2){
//     return number1 - number2
// }
    
// let subtractNumbers = function(){
//     return document.querySelector("#difference").value = subtract(parseFloat(document.querySelector("#minuend").value), parseFloat(document.querySelector("#subtrahend").value))
// }

// document.querySelector("#subtractNumbers").addEventListener("click", subtractNumbers)

// let multiply = (number1, number2) => number1 * number2

// let multiplyNumbers = () => document.querySelector("#product").value = multiply(parseFloat(document.querySelector("#factor1").value), parseFloat(document.querySelector("#factor2").value))

// document.querySelector("#multiplyNumbers").addEventListener("click", multiplyNumbers)

// let divide = (number1, number2) => number1 / number2

// let divideNumbers = () => document.querySelector("#quotient").value = divide(parseFloat(document.querySelector("#dividend").value), parseFloat(document.querySelector("#divisor").value))

// document.querySelector("#divideNumbers").addEventListener("click", divideNumbers)




// const date = new Date() 

// let curYear

// curYear = date.getFullYear()

// document.querySelector("#year").textContent = curYear