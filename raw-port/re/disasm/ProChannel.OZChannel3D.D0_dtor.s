__ZN11OZChannel3DD0Ev:
000000000004950a	pushq	%rbp
000000000004950b	movq	%rsp, %rbp
000000000004950e	pushq	%rbx
000000000004950f	pushq	%rax
0000000000049510	movq	%rdi, %rbx
0000000000049513	leaq	0x8d626(%rip), %rax
000000000004951a	movq	%rax, (%rdi)
000000000004951d	leaq	0x8d96c(%rip), %rax
0000000000049524	movq	%rax, 0x10(%rdi)
0000000000049528	addq	$0x1b8, %rdi                    ## imm = 0x1B8
000000000004952f	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000049534	movq	%rbx, %rdi
0000000000049537	callq	__ZN11OZChannel2DD2Ev           ## OZChannel2D::~OZChannel2D()
000000000004953c	movq	%rbx, %rdi
000000000004953f	addq	$0x8, %rsp
0000000000049543	popq	%rbx
0000000000049544	popq	%rbp
0000000000049545	jmp	0xace04                         ## symbol stub for: __ZdlPv
