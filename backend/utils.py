from jinja2 import Template


# Local functions
def roles_list(roles):
    roles_list=[]
    for role in roles:
        roles_list.append(role.name)
    return roles_list


def format_report(html_template, data):
    with open(html_template) as file:
        template = Template(file.read())
        return template.render(data = data)