__ZN13HGLegacyBlend10RenderPageEP6HGPage:
0000000000242530	pushq	%rbp
0000000000242531	movq	%rsp, %rbp
0000000000242534	pushq	%r14
0000000000242536	pushq	%rbx
0000000000242537	movq	%rsi, %rbx
000000000024253a	movq	%rdi, %r14
000000000024253d	leaq	0x6e427c(%rip), %rdi            ## literal pool for: "HGLegacyBlend does not support OpenGL."
0000000000242544	xorl	%eax, %eax
0000000000242546	callq	__ZN8HGLogger5errorEPKcz        ## HGLogger::error(char const*, ...)
000000000024254b	movq	%r14, %rdi
000000000024254e	movq	%rbx, %rsi
0000000000242551	popq	%rbx
0000000000242552	popq	%r14
0000000000242554	popq	%rbp
0000000000242555	jmp	__ZN6HGNode10RenderPageEP6HGPage ## HGNode::RenderPage(HGPage*)
000000000024255a	nopw	(%rax,%rax)
