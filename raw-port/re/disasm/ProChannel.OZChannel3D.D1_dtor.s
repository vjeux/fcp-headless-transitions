__ZN11OZChannel3DD1Ev:
00000000000494d2	pushq	%rbp
00000000000494d3	movq	%rsp, %rbp
00000000000494d6	pushq	%rbx
00000000000494d7	pushq	%rax
00000000000494d8	movq	%rdi, %rbx
00000000000494db	leaq	0x8d65e(%rip), %rax
00000000000494e2	movq	%rax, (%rdi)
00000000000494e5	leaq	0x8d9a4(%rip), %rax
00000000000494ec	movq	%rax, 0x10(%rdi)
00000000000494f0	addq	$0x1b8, %rdi                    ## imm = 0x1B8
00000000000494f7	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
00000000000494fc	movq	%rbx, %rdi
00000000000494ff	addq	$0x8, %rsp
0000000000049503	popq	%rbx
0000000000049504	popq	%rbp
0000000000049505	jmp	__ZN11OZChannel2DD2Ev           ## OZChannel2D::~OZChannel2D()
