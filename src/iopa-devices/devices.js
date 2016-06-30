/*
 * Internet Open Protocol Abstraction (IOPA)
 * Copyright (c) 2016 Internet of Protocols Alliance 
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//DEVICES AND THINGS
exports.DEVICE =
{ 
    // Model
    ModelManufacturer: "device.ModelManufacturer",    // e.g., "Domabo"
    ModelManufacturerUrl: "device.ModelManufacturerUrl",   // e.g., "http://domabo.com"
    ModelName: "device.ModelName",  // e.g., "HomeKit Stick"
    ModelNumber: "device.ModelNumber",  // e.g., "HK100"
    ModelUrl: "device.ModelUrl",  // e.g., "http://domabo.com/support/HK100"
   
    // Physical Platform Instance
    PlatformId: "device.PlatformId",
    PlatformName: "device.PlatformName",   // e.g., "HomeKit Stick Primary"
    PlatformFirmware: "device.PlatformFirmware",   // e.g., "1.3.5"
    PlatformOS: "device.PlatformOS",  // e.g., "14.10.1"
    PlatformHardware: "device.PlatformHardware",  // e.g. "1.0B"
    PlatformDate: "device.PlatformDate",  // e.g., 2016-12-23
    
    // IOPA Logical Device (can be >1 per physical platform
    Id: "device.Id",   // e.g., "23424-22423-63653-2424-26262"
    Type: "device.Type", // e.g., "urn:com.domabo:Lightswitch"
    Version: "device.Version",  // e.g., "1.3.5"
    Location: "device.Location",   // e.g., {37.7833, 122.4167}
    LocationName: "device.LocationName", // e.g., "The Bellevue"
    Currency: "device.Currency", // e.g., "USD"
    Region: "device.Region",  // e.g., "Home"
    SystemTime: "device.SystemTime",
    Uri: "device.Uri", //e.g, "coap://locahost:23200/homestick"
    Resources: "device.Resources",
    
    TYPE: {
        Platform: "thing.Platform",
        Device: "thing.Device",
        Resource: "thing.Resource",
        Property: "thing.Property",
        Interface: "thing.Interface",
        Scene: "thing.Scene",
        Workflow: "thing.Workflow",
        WorkflowItem: "thing.WorkflowItem",
        Group: "thing.Group",
    },

    POLICY: {
        Observable: "Discoverable",
        Discoverable: "Observable",
        Access: "Access"
    },

    MAINTENANCE: {
        FactoryReset: "FactoryReset",
        Reboot: "Reboot",
        StartStats: "StartStats"
    },

    WELLKNOWN: {
        PathBase: "/iopa",

        Configure: "/configure",
        Device: "/device",
        Interfaces: "/interfaces",
        Maintenance: "/maintenance",
        Monitoring: "/monitoring",
        Platform: "/platform",
        Ping: "/ping",
        Resources: "/resources",
        ResourceTypes: "/resourcetypes",
    }

};

exports.RESOURCE={
    TypeName: "resource.TypeName",   // e.g., "Smart Home Bridge Device""
    Type: "resource.Type",   // e.g., "iopa.d.b"   Smart Home Bridge Device
    Interface: "resource.Interface",   // e.g., "iopa.if.r"
    Path: "resource.Path",   // e.g., "/myhouse/smartbridge" relative to device uri
    Policy: "resource.Policy",
    Name: "resource.Name",
    Properties: "resource.Properties",
    Value: "resource.Value",   // e.g., "OK"
    Parent: "resource.Parent", // e.g., link to device from resource
    Links: "resource.Links",  // e.g., links to each device in homekit network
};

exports.MQTT = {
    ProtocolId: "mqtt.ProtocolId",
    ProtocolVersion: "mqtt.ProtocolVersion",
    Clean: "mqtt.Clean",
    ClientId: "mqtt.ClientId",
    KeepAlive: "mqtt.KeepAlive",
    UserName: "mqtt.UserName",
    Password: "mqtt.Password",
    Will: "mqtt.Will",
    Qos: "mqtt.Qos",
    Subscriptions: "mqtt.Subscriptions",
    Dup: "mqtt.Dup",
    Retain: "mqtt.Retain",
    SessionPresent: "mqtt.SessionPresent",
    Granted: "mqtt.Granted",

    METHODS: {
        CONNECT: "CONNECT",
        SUBSCRIBE: "SUBSCRIBE",
        UNSUBSCRIBE: "UNSUBSCRIBE",
        PUBLISH: "PUBLISH",
        PINGREQ: "PINGREQ",
        DISCONNECT: "DISCONNECT",
        CONNACK: "CONNACK",
        SUBACK: "SUBACK",
        UNSUBACK: "UNSUBACK",
        PUBACK: "PUBACK",
        PUBREC: "PUBREC",
        PUBREL: "PUBREL",
        PUBCOMP: "PUBCOMP",
        PINGRESP: "PINGRESP"
    },

    RETURN_CODES:
    {
        0: 'OK',
        1: 'Unacceptable protocol version',
        2: 'Identifier rejected',
        3: 'Server unavailable',
        4: 'Bad user name or password',
        5: 'Not authorized',
    }

};

exports.COAP = {

    Ack: "coap.Ack",
    Reset: "coap.Reset",
    Confirmable: "coap.Confirmable",
    Code: "coap.Code",
    Options: "coap.Options",

    MAXPACKETSIZE: 1280,
    MULTICASTIPV4: "224.0.1.187",
    MULTICASTIPV6: "FF0X::FD",


    CODES: {
        '0.01': 'GET'
        , '0.02': 'POST'
        , '0.03': 'PUT'
        , '0.04': 'DELETE'
    },

    METHODS: {
        'GET': '0.01'
        , 'POST': '0.02'
        , 'PUT': '0.03'
        , 'DELETE': '0.04'
    },

    STATUS_CODES: {
        // Empty Message
        "0.00": "Empty" 
    
    // Class 0: Request Methods
        , "0.01": "GET"
        , "0.02": "POST"
        , "0.03": "PUT"
        , "0.04": "DELETE"
    
    // Class 2: Success Responses
        , "2.01": "Created"
        , "2.02": "Deleted"
        , "2.03": "Valid"
        , "2.04": "Changed"
        , "2.05": "Content"
    
    // Class 4: Client Errors
        , "4.00": "Bad Request"
        , "4.01": "Unauthorized"
        , "4.02": "Bad Option"
        , "4.03": "Forbidden"
        , "4.04": "Not Found"
        , "4.05": "Method Not Allowed"
        , "4.06": "Not Acceptable"
        , "4.12": "Precondition Failed"
        , "4.13": "Request Entity Too Large"
        , "4.15": "Unsupported Content-Format"
    
    // Class 5: Server Errors
        , "5.00": "Internal Server Error"
        , "5.01": "Not Implemented"
        , "5.02": "Bad Gateway"
        , "5.03": "Service Unavailable"
        , "5.04": "Gateway Timeout"
        , "5.05": "Proxying Not Supported"
    }
}