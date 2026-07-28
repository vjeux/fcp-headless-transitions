__ZN25HGPremultiplyWhiteToBlackD2Ev:
0000000000157f70	pushq	%rbp
0000000000157f71	movq	%rsp, %rbp
0000000000157f74	pushq	%rbx
0000000000157f75	pushq	%rax
0000000000157f76	movq	%rdi, %rbx
0000000000157f79	leaq	0x8c8688(%rip), %rax
0000000000157f80	movq	%rax, (%rdi)
0000000000157f83	movq	0x198(%rdi), %rdi
0000000000157f8a	movq	(%rdi), %rax
0000000000157f8d	callq	*0x18(%rax)
0000000000157f90	movq	%rbx, %rdi
0000000000157f93	addq	$0x8, %rsp
0000000000157f97	popq	%rbx
0000000000157f98	popq	%rbp
0000000000157f99	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000157f9e	movq	%rax, %rdi
0000000000157fa1	callq	___clang_call_terminate
0000000000157fa6	nopw	%cs:(%rax,%rax)
