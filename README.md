# Atmosphere Cloud API documentations

A cloud-based, abstract, measurement-oriented framework for managing smart things in IoT ecosystems. Atmosphere focus on the concept of measurement, as this type of data is very common in IoT, which makes it easier and more effective the process of abstraction needed to target different domains and operational contexts.

We tested the framework and its workflow in three industrial research projects analyzing data and enabling new services in the health and automotive domains. Our experience showed the benefits – especially in terms of development efficiency and effectiveness - of exploiting Atmosphere, which does not tie the development to a proprietary commercial platform, nor requires the huge set-up times needed to start from scratch a solution. Furthermore, customizing Atmosphere based on new requirements has proven to be easily feasible, also keeping abstraction for reusability.

In order to support the IoT developer community, Atmosphere is released open source under MIT licence.

## Main concepts

Atmosphere was designed to represent the application context and its elements as interrelated software objects, onto which to build applications. These objects are modeled as resources, with own models and functionalities, accessible through a set of RESTful API routes.

At the core of these resources are the essential elements that are common in the IoT environment: Thing, Feature, Device, and Measurement. A Thing represents the subject of a Measurement. A Feature describes the (typically physical) quantitity measured by a Device. Each item in a Feature has a name and a unit. A Device is a tool providing Measurements regarding a Thing. A Measurement represents a value of a Feature measured by a Device for a specific Thing. Other supplementary resources are User, Log, Login, Script, Tag, Constraint, and Computation.

The concept of Measurement abstracts the values posted to and retrieved from the Cloud. Its structure must match the type of measured Feature. Each measurement is a vector of samples. They could be samples collected at different times (taken at intervals specified by the “delta” field), a single value or a set of statistical information (e.g., average, stdev, etc.). Each sample can be a scalar (e.g. a temperature), a vector (e.g. the orientation in space) or a tensor of numbers (e.g., general multidimensional data points).

The Feature resource is used to validate  the value array of each received measurement. This is shown in Figure 1, where the attributes Dimensions and Dimension order (1 for scalar, 2 for vectors, 3 for matrices, etc.) from the Feature resource must match the size of the Measurement’s value array and its depth, respectively.

We also defined the Computation resource, which makes complex queries to perform post-processing calculation on measurements, exploiting the cloud server capabilities. The result of a Computation is structured as a Measurement, thus xxxx

## A quick introduction

## Installation

## Applications

Links a L3P e agli altri progetti.

## Papers

Lista dei papers


