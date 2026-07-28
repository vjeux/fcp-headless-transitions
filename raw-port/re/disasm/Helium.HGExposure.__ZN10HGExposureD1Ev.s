__ZN10HGExposureD1Ev:
00000000001a8fa0	pushq	%rbp
00000000001a8fa1	movq	%rsp, %rbp
00000000001a8fa4	pushq	%rbx
00000000001a8fa5	pushq	%rax
00000000001a8fa6	leaq	0x87c99b(%rip), %rax
00000000001a8fad	movq	%rax, (%rdi)
00000000001a8fb0	movq	0x1f0(%rdi), %rax
00000000001a8fb7	testq	%rax, %rax
00000000001a8fba	je	0x1a8fcb
00000000001a8fbc	movq	(%rax), %rcx
00000000001a8fbf	movq	%rdi, %rbx
00000000001a8fc2	movq	%rax, %rdi
00000000001a8fc5	callq	*0x18(%rcx)
00000000001a8fc8	movq	%rbx, %rdi
00000000001a8fcb	addq	$0x8, %rsp
00000000001a8fcf	popq	%rbx
00000000001a8fd0	popq	%rbp
00000000001a8fd1	jmp	__ZN13HGColorMatrixD2Ev         ## HGColorMatrix::~HGColorMatrix()
00000000001a8fd6	movq	%rax, %rdi
00000000001a8fd9	callq	___clang_call_terminate
00000000001a8fde	nop
