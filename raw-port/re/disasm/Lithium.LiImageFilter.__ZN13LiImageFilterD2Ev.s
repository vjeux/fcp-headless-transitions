__ZN13LiImageFilterD2Ev:
000000000004d608	pushq	%rbp
000000000004d609	movq	%rsp, %rbp
000000000004d60c	pushq	%r14
000000000004d60e	pushq	%rbx
000000000004d60f	movq	%rsi, %rbx
000000000004d612	movq	%rdi, %r14
000000000004d615	movq	(%rsi), %rax
000000000004d618	movq	%rax, (%rdi)
000000000004d61b	movq	0x28(%rsi), %rcx
000000000004d61f	movq	-0x18(%rax), %rax
000000000004d623	movq	%rcx, (%rdi,%rax)
000000000004d627	addq	$0x18, %rdi
000000000004d62b	callq	0x1c4342                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000004d630	addq	$0x8, %rbx
000000000004d634	movq	%r14, %rdi
000000000004d637	movq	%rbx, %rsi
000000000004d63a	popq	%rbx
000000000004d63b	popq	%r14
000000000004d63d	popq	%rbp
000000000004d63e	jmp	__ZN13LiImageSourceD2Ev         ## LiImageSource::~LiImageSource()
000000000004d643	nop
