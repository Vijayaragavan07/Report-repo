// Copyright (c) 2024, Vijayaragavan R and contributors
// For license information, please see license.txt

frappe.query_reports["Trial Report"] = {
	"filters": [
		{
			"fieldname": "company",
			"label": __("Company"),
			"fieldtype": "Link",
			"options": "Company",
			"default": frappe.defaults.get_user_default("Company"),
			"reqd": 1
		},
		{
			"fieldname": "fiscal_year",
			"label": __("Fiscal Year"),
			"fieldtype": "Link",
			"options": "Fiscal Year",
			"default": erpnext.utils.get_fiscal_year(frappe.datetime.get_today()),
			"reqd": 1,
			"on_change": function(query_report) {
				var fiscal_year = query_report.get_values().fiscal_year;
				if (!fiscal_year) {
					return;
				}
				frappe.model.with_doc("Fiscal Year", fiscal_year, function(r) {
					var fy = frappe.model.get_doc("Fiscal Year", fiscal_year);
					frappe.query_report.set_filter_value({
						from_date: fy.year_start_date,
						to_date: fy.year_end_date
					});
				});
			}
		},
		{
			"fieldname": "from_date",
			"label": __("From Date"),
			"fieldtype": "Date",
			"default": erpnext.utils.get_fiscal_year(frappe.datetime.get_today(), true)[1],
		},
		{
			"fieldname": "to_date",
			"label": __("To Date"),
			"fieldtype": "Date",
			"default": erpnext.utils.get_fiscal_year(frappe.datetime.get_today(), true)[2],
		},
		{
			"fieldname": "cost_center",
			"label": __("Cost Center"),
			"fieldtype": "Link",
			"options": "Cost Center",
			"get_query": function() {
				var company = frappe.query_report.get_filter_value('company');
				return {
					"doctype": "Cost Center",
					"filters": {
						"company": company,
					}
				}
			}
		},
		{
            "fieldname": "upload",
            "label": __("Upload Chart of Accounts"),
            "fieldtype": "Button",
            "click": function() {
                // Create an input element for file selection
                let input = document.createElement('input');
                input.type = 'file';
                input.accept = '.xls,.xlsx';
                input.onchange = async function(event) {
                    let file = event.target.files[0];
                    if (file) {
                        // Create a FormData object to hold the file data
                        let formData = new FormData();
                        formData.append('file', file);

                        try {
                            let uploadResponse = await fetch('/api/method/upload_file', {
                                method: 'POST',
                                headers: {
                                    'X-Frappe-CSRF-Token': frappe.csrf_token
                                },
                                body: formData
                            });

                            let uploadResult = await uploadResponse.json();
							console.log(uploadResult.message);
							console.log(uploadResult.message.file_url);

                            if (uploadResult.message && uploadResult.message.file_url) {
                                let file_url = uploadResult.message.file_url;

								console.log("file url",file_url);

								let processResponse = await frappe.call({
                                    method: 'trial_report.trial_report.report.trial_report.trial_report.upload_chart_of_accounts',
                                    args: {
                                        file_url: file_url,
										name:uploadResult.message.name
                                    }
                                });
								console.log(processResponse.message)
                                if (processResponse.message) {
                                    frappe.msgprint(__('File uploaded and processed successfully.'));
                                } else {
                                    frappe.msgprint(__('Failed to process file1.'));
                                }
                            } else {
                                frappe.msgprint(__('Failed to upload file2.'));
                            }
                        } catch (error) {
                            frappe.msgprint(__('Failed to upload file3.'));
                        }
                    }
                };
                // Trigger the file input dialog
                input.click();
            }
        },	
		{
			"fieldname": "project",
			"label": __("Project"),
			"fieldtype": "Link",
			"options": "Project"
		},
		{
			"fieldname": "finance_book",
			"label": __("Finance Book"),
			"fieldtype": "Link",
			"options": "Finance Book",
		},
		{
			"fieldname": "presentation_currency",
			"label": __("Currency"),
			"fieldtype": "Select",
			"options": erpnext.get_presentation_currency_list()
		},
		{
			"fieldname": "with_period_closing_entry_for_opening",
			"label": __("With Period Closing Entry For Opening Balances"),
			"fieldtype": "Check",
			"default": 1
		},
		{
			"fieldname": "with_period_closing_entry_for_current_period",
			"label": __("Period Closing Entry For Current Period"),
			"fieldtype": "Check",
			"default": 1
		},
		{
			"fieldname": "show_zero_values",
			"label": __("Show zero values"),
			"fieldtype": "Check"
		},
		{
			"fieldname": "show_unclosed_fy_pl_balances",
			"label": __("Show unclosed fiscal year's P&L balances"),
			"fieldtype": "Check"
		},
		{
			"fieldname": "include_default_book_entries",
			"label": __("Include Default FB Entries"),
			"fieldtype": "Check",
			"default": 1
		},
		{
			"fieldname": "show_net_values",
			"label": __("Show net values in opening and closing columns"),
			"fieldtype": "Check",
			"default": 1
		},
	
	],
	"formatter": erpnext.financial_statements.formatter,
	"tree": true,
	"name_field": "account",
	"parent_field": "parent_account",
	"initial_depth": 3
}

erpnext.utils.add_dimensions('Trial Report', 6);