import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface CustomScript {
  id: number;
  name: string;
  description: string;
  script: string;
  location: 'head' | 'body_start' | 'body_end';
  isActive: boolean;
  createdAt: string;
}

export default function CustomScripts() {
  const { data: scripts = [] } = useQuery({
    queryKey: ["/api/custom-scripts"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  }) as { data: CustomScript[] };

  useEffect(() => {
    console.log("CustomScripts: Loading scripts", scripts);
    if (!scripts.length) {
      console.log("CustomScripts: No scripts found");
      return;
    }

    // Remove existing custom scripts to avoid duplicates
    const existingScripts = document.querySelectorAll('[data-custom-script]');
    existingScripts.forEach(script => script.remove());

    scripts.forEach((scriptConfig) => {
      console.log(`CustomScripts: Processing script "${scriptConfig.name}"`, {
        isActive: scriptConfig.isActive,
        location: scriptConfig.location,
        script: scriptConfig.script?.substring(0, 100) + "..."
      });

      if (!scriptConfig.isActive) {
        console.log(`CustomScripts: Skipping inactive script "${scriptConfig.name}"`);
        return;
      }

      try {
        // Create a container div to safely parse HTML content using DOMParser
        const parser = new DOMParser();
        const doc = parser.parseFromString(scriptConfig.script, 'text/html');
        const container = document.createElement('div');
        container.setAttribute('data-custom-script', scriptConfig.id.toString());
        container.setAttribute('data-script-name', scriptConfig.name);
        
        // Safely move parsed nodes to container (also check head nodes for scripts in head)
        const allNodes = [...Array.from(doc.head.childNodes), ...Array.from(doc.body.childNodes)];
        allNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
            container.appendChild(node.cloneNode(true));
          }
        });
        console.log(`CustomScripts: Parsed HTML for "${scriptConfig.name}":`, container.childNodes.length, "nodes");
        
        // Get the target location
        let targetElement;
        switch (scriptConfig.location) {
          case 'head':
            targetElement = document.head;
            break;
          case 'body_start':
            targetElement = document.body;
            break;
          case 'body_end':
          default:
            targetElement = document.body;
            break;
        }

        // Process each child element in the container
        Array.from(container.childNodes).forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            if (element.tagName === 'SCRIPT') {
              // Create a new script element
              const newScript = document.createElement('script');
              newScript.setAttribute('data-custom-script', scriptConfig.id.toString());
              
              // Copy attributes
              Array.from(element.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
              });
              
              // Set content or src
              if (element.getAttribute('src')) {
                newScript.src = element.getAttribute('src')!;
                console.log(`CustomScripts: Adding external script from "${element.getAttribute('src')}" to ${scriptConfig.location}`);
              } else {
                newScript.textContent = element.textContent;
                console.log(`CustomScripts: Adding inline script to ${scriptConfig.location}:`, element.textContent?.substring(0, 100) + "...");
                
                // For Tawk.to scripts, ensure proper execution
                if (element.textContent?.includes('Tawk_API')) {
                  newScript.onload = () => {
                    console.log('✅ CustomScripts: Tawk.to script executed successfully');
                  };
                  newScript.onerror = (error) => {
                    console.error('❌ CustomScripts: Tawk.to script failed to load:', error);
                  };
                }
              }
              
              // Insert into correct location
              if (scriptConfig.location === 'body_start') {
                targetElement.insertBefore(newScript, targetElement.firstChild);
              } else {
                targetElement.appendChild(newScript);
              }
              
              console.log(`CustomScripts: Script "${scriptConfig.name}" added to ${scriptConfig.location}`);
              
              // For Tawk.to and LiveChat, trigger initialization
              if (scriptConfig.name.toLowerCase().includes('chat')) {
                setTimeout(() => {
                  if (typeof window !== 'undefined') {
                    // Check for Tawk.to
                    if ((window as any).Tawk_API) {
                      console.log('✅ CustomScripts: Tawk.to widget loaded successfully!');
                      // Force show the widget if it's hidden
                      if ((window as any).Tawk_API.showWidget) {
                        (window as any).Tawk_API.showWidget();
                      }
                    }
                    // Check for LiveChat
                    if ((window as any).__lc) {
                      console.log('✅ CustomScripts: LiveChat widget loaded successfully!');
                    }
                    // Also check for $_Tawk global variable
                    if ((window as any).$_Tawk) {
                      console.log('✅ CustomScripts: Tawk.to core loaded!');
                    }
                  }
                }, 3000);
              }
            } else {
              // For non-script elements (like noscript), clone and append
              const clonedElement = element.cloneNode(true) as Element;
              clonedElement.setAttribute('data-custom-script', scriptConfig.id.toString());
              
              if (scriptConfig.location === 'body_start') {
                targetElement.insertBefore(clonedElement, targetElement.firstChild);
              } else {
                targetElement.appendChild(clonedElement);
              }
            }
          } else if (node.nodeType === Node.COMMENT_NODE) {
            // Handle HTML comments
            const commentClone = node.cloneNode(true);
            if (scriptConfig.location === 'body_start') {
              targetElement.insertBefore(commentClone, targetElement.firstChild);
            } else {
              targetElement.appendChild(commentClone);
            }
          }
        });
        
      } catch (error) {
        console.error(`Failed to load custom script "${scriptConfig.name}":`, error);
      }
    });

    // Cleanup function
    return () => {
      const scriptsToRemove = document.querySelectorAll('[data-custom-script]');
      scriptsToRemove.forEach(script => script.remove());
    };
  }, [scripts]);

  return null; // This component doesn't render anything visible
}