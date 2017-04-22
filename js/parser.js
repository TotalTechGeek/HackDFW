var speed = [];
var acceleration = [];
var steeringWheel = [];
var callbacks = [];

var arrayOffsets = {};
var lastSpeed = 0;

// simulation variables
var simulationStartIndex = 0;
var simulationSecondIndex = simulationStartIndex;

var speedSum = 0;
var maxSpeed = null;
var minSpeed = null;

var unloaded = 0;

var accelerationSum = 0;
var minAcceleration = 0;
var maxAcceleration = 0;

function init()
{
    var fileInput = document.getElementById('fileInput');

    fileInput.addEventListener('change', function(e)
    {
        var file = fileInput.files[0];
        var textType = "vnd.ms-excel";

        if (file.type.match(textType))
        {
            var reader = new FileReader();

            reader.onload = function(e)
            {
                var fileText = reader.result;
                var lines = fileText.split('\n');

                var MAX_COUNT = 1530;

                var DATA_COUNT = lines.length;
                var i = 1;

                var lineVals = lines[0].split(",");

                for (var k = 0; k < lineVals.length; k++)
                {
                    if (lineVals[k] == "Steering_Angle_Degree")
                    {
                        arrayOffsets["angle"] = k;
                    }

                    if (lineVals[k] == "Vehicle_Speed")
                    {
                        arrayOffsets["speed"] = k;
                    }
                }

                function asyncRead()
                {
                    var count = 0;
                    var j = i;
                    // discard first line of input
                    for (i = i; i < DATA_COUNT; i++)
                    {
                        var line = lines[getPosition(i)];
                        parseLine(line);

                        if (count++ == MAX_COUNT)
                        {
                            setTimeout(asyncRead, 100);
                            break;
                        }
                    }

                    count = 0;
                    // calculate acceleration
                    for (j = j; j < DATA_COUNT; j++)
                    {
                        acceleration.push(speed[getPosition(j)] - speed[getPosition(j - 1)]);

                        if (count++ == MAX_COUNT)
                        {
                            break;
                        }
                    }
                    if (minSpeed == null)
                    {
                        minSpeed = speed[0];
                        maxSpeed = speed[0];
                        minAcceleration = acceleration[0];
                        maxAcceleration = acceleration[0];
                    }
                }

                asyncRead();

                // after parsing data, start simulation
                setInterval('simulate()', 100);
            }
            reader.readAsText(file);
        }
        else
        {
            alert("File type not supported.");
        }

    });
}

function addCallback(callback)
{
    callbacks.push(callback);
}

function executeCallbacks()
{
    callbacks.forEach(function(v)
    {
        v();
    });
}

function getPosition(i)
{
    return i - unloaded;
}

function unload()
{
    if (getPosition(getSimulationSecond()) > 5500)
    {
        speed.splice(0, 5490);
        acceleration.splice(0, 5490);
        steeringWheel.splice(0, 5490);
        unloaded += 5490;
    }
}

function getSimulationSecond()
{
    return simulationSecondIndex;
}

function getSteeringWheelAngle(second)
{
    return steeringWheel[getPosition(second)];
}

function getAcceleration(secondIndex)
{
    return acceleration[getPosition(secondIndex)];
}

function getAverageAcceleration()
{
    return accelerationSum / (simulationSecondIndex - simulationStartIndex);
}

function getMinAcceleration()
{
    return minAcceleration;
}

function getMaxAcceleration()
{
    return maxAcceleration;
}

function getSpeed(secondIndex)
{
    return speed[getPosition(secondIndex)];
}

function getAverageSpeed()
{
    return speedSum / (simulationSecondIndex - simulationStartIndex);
}

function getMaxSpeed()
{
    return maxSpeed;
}

function getMinSpeed()
{
    return minSpeed;
}

function parseLine(data)
{
    var tokens = data.split(',');

    if (tokens[arrayOffsets["speed"]].length != 0)
        lastSpeed = parseFloat(tokens[arrayOffsets["speed"]]);

    speed.push(lastSpeed);
    steeringWheel.push(tokens[arrayOffsets["angle"]]);
}

function simulate(display)
{
    var speed = getSpeed(simulationSecondIndex);
    var acceleration = getAcceleration(simulationSecondIndex);

    if (speed < minSpeed)
        minSpeed = speed;
    if (speed > maxSpeed)
        maxSpeed = speed;
    speedSum += speed;

    if (acceleration < minAcceleration)
        minAcceleration = acceleration;
    if (acceleration > maxAcceleration)
        maxAcceleration = acceleration;
    accelerationSum += acceleration;

    simulationSecondIndex++;
    unload();
    executeCallbacks();
}