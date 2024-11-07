import sys
from Campaign import Campaign
from Workbook import create_workbook, save_workbook, apply_styles, add_sheet, save_dataframe_to_sheet, apply_conditional_formatting

def create_report(campaign):
    campaign.workbook = create_workbook()

    if "Sheet" in campaign.workbook.sheetnames:
        del campaign.workbook["Sheet"]

    add_sheet(campaign.workbook, "Statistics")
    save_dataframe_to_sheet(campaign.workbook, "Statistics", "Overall-Statistics", campaign.overall_statistics_df, columns=['Action', 'Count'], start_row=1, start_col=1)
    save_dataframe_to_sheet(campaign.workbook, "Statistics", "Unique-Statistics", campaign.unique_statistics_df, columns=['Action', 'Unique Count'], start_row=8, start_col=1)
    apply_styles(campaign.workbook, "Statistics")


    add_sheet(campaign.workbook, "Campaign Results")
    save_dataframe_to_sheet(campaign.workbook, "Campaign Results", "Detailed-Results", campaign.detailed_results_df, columns=['first_name', 'last_name', 'email', 'Clicked Link', 'Activity Detected', 'Submitted Data'], start_row=1, start_col=1)
    apply_styles(campaign.workbook, "Campaign Results")
    apply_conditional_formatting(campaign.workbook["Campaign Results"], campaign.detailed_results_df, ['Clicked Link', 'Activity Detected', 'Submitted Data'])

    add_sheet(campaign.workbook, "Provided Data")
    columns_to_exclude = ['campaign_id', 'details']
    filtered_columns = [col for col in campaign.provided_data_df.columns if col not in columns_to_exclude]
    save_dataframe_to_sheet(campaign.workbook, "Provided Data", "Provided-Data", campaign.provided_data_df, columns=filtered_columns, start_row=1, start_col=1)
    apply_styles(campaign.workbook, "Provided Data")

    add_sheet(campaign.workbook, "Raw Events")
    save_dataframe_to_sheet(campaign.workbook, "Raw Events", "Raw-Data", campaign.raw_events_df, columns=['first_name', 'last_name', 'email', 'timestamp', 'action', 'address', 'user-agent', campaign.rid], start_row=1, start_col=1)
    apply_styles(campaign.workbook, "Raw Events")

    save_workbook(campaign.workbook, campaign.output_file)


if __name__ == "__main__":
    print("Usage: python3 reporter.py in_file.csv outfile.csv used_rid")
    print("Example: python3 reporter.py in_file.csv outfile.csv show")

    filename_input = sys.argv[1]
    filename_output = sys.argv[2]
    rid = sys.argv[3]


    campaign = Campaign(filename_input, filename_output, rid)
    campaign.load_csv()
    campaign.read_statistics()
    campaign.read_campaign_results()
    campaign.read_provided_data()
    campaign.read_raw_events()

    create_report(campaign)
    print(f"\nDone - file saved as {filename_output} - Happy reporting!")




