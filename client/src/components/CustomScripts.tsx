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
    if (!scripts.length) return;

    // Remove existing custom scripts to avoid duplicates
    const existingScripts = document.querySelectorAll('[data-custom-script]');
    existingScripts.forEach(script => script.remove());

    scripts.forEach((scriptConfig) => {
      if (!scriptConfig.isActive) return;

      try {
        // Create a container div to safely parse HTML content
        const container = document.createElement('div');
        container.setAttribute('data-custom-script', scriptConfig.id.toString());
        container.setAttribute('data-script-name', scriptConfig.name);
        
        // Parse the script content safely
        container.innerHTML = scriptConfig.script;
        
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
              } else {
                newScript.textContent = element.textContent;
              }
              
              // Insert into correct location
              if (scriptConfig.location === 'body_start') {
                targetElement.insertBefore(newScript, targetElement.firstChild);
              } else {
                targetElement.appendChild(newScript);
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