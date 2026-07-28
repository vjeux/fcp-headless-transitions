__ZN13HGPremultiplyD1Ev:
0000000000157bb0	pushq	%rbp
0000000000157bb1	movq	%rsp, %rbp
0000000000157bb4	pushq	%rbx
0000000000157bb5	pushq	%rax
0000000000157bb6	movq	%rdi, %rbx
0000000000157bb9	leaq	0x8c85c8(%rip), %rax
0000000000157bc0	movq	%rax, (%rdi)
0000000000157bc3	movq	0x198(%rdi), %rdi
0000000000157bca	movq	(%rdi), %rax
0000000000157bcd	callq	*0x18(%rax)
0000000000157bd0	movq	%rbx, %rdi
0000000000157bd3	addq	$0x8, %rsp
0000000000157bd7	popq	%rbx
0000000000157bd8	popq	%rbp
0000000000157bd9	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000157bde	movq	%rax, %rdi
0000000000157be1	callq	___clang_call_terminate
0000000000157be6	nopw	%cs:(%rax,%rax)
__ZN13HGPremultiplyD0Ev:
