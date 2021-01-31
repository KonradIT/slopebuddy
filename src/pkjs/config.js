module.exports = [
	{
		"type": "section",
		"items": [
			{
				"type": "heading",
				"defaultValue": "Slope Buddy"
			},
			{
				"type": "text",
				"defaultValue": "Slope Buddy relies on weatherunlocked.com to provide ski resort data. Create an account (its free), add one ski resort of your choice in the dashboard, then enter the API ID, API Key and Resort ID in this page.",
			},
			{
				"type": "input",
				"appKey": "apikey",
				"label": "API Key",
				"attributes": {
					"required": "required",
				}
			},
			{
				"type": "input",
				"appKey": "apiid",
				"label": "API ID",
				"attributes": {
					"required": "required",
				}
			},
			{
				"type": "input",
				"appKey": "resortid",
				"label": "Resort ID",
				"attributes": {
					"required": "required",
				}
			},
			{
				"type": "slider",
				"appKey": "daystoshow",
				"defaultValue": 5,
				"label": "Days to show",
				"description": "How many days to show in the forecast",
				"min": 1,
				"max": 7,
				"step": 1
			},
			{
				"type": "radiogroup",
				"appKey": "units",
				"label": "Metric or Imperial",
				"defaultValue": "metric",
				"options": [
					{
						"label": "Metric",
						"value": "metric"
					},
					{
						"label": "Imperial",
						"value": "imperial"
					},
				]
			},
			{
				"type": "submit",
				"defaultValue": "Save"
			}
		]
	}
];