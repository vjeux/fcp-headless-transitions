__ZN8HGNode3D14RenderFragmentEP10HGFragmentP6HGTile:
0000000000122280	pushq	%rbp
0000000000122281	movq	%rsp, %rbp
0000000000122284	leaq	0x7c627a(%rip), %rdi            ## literal pool for: "WARNING - RenderFragment invoked on non -fragment compiled node\n"
000000000012228b	xorl	%eax, %eax
000000000012228d	callq	__ZN8HGLogger7warningEPKcz      ## HGLogger::warning(char const*, ...)
0000000000122292	xorl	%eax, %eax
0000000000122294	popq	%rbp
0000000000122295	retq
0000000000122296	nopw	%cs:(%rax,%rax)
