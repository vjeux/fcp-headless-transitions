__ZN11OZChannel2DD2Ev:
0000000000048b7c	pushq	%rbp
0000000000048b7d	movq	%rsp, %rbp
0000000000048b80	pushq	%rbx
0000000000048b81	pushq	%rax
0000000000048b82	movq	%rdi, %rbx
0000000000048b85	leaq	0x8dbfc(%rip), %rax
0000000000048b8c	movq	%rax, (%rdi)
0000000000048b8f	leaq	0x8df3a(%rip), %rax
0000000000048b96	movq	%rax, 0x10(%rdi)
0000000000048b9a	addq	$0x120, %rdi                    ## imm = 0x120
0000000000048ba1	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000048ba6	leaq	0x88(%rbx), %rdi
0000000000048bad	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000048bb2	movq	%rbx, %rdi
0000000000048bb5	addq	$0x8, %rsp
0000000000048bb9	popq	%rbx
0000000000048bba	popq	%rbp
0000000000048bbb	jmp	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
