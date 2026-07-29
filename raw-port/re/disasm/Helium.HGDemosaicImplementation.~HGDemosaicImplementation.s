__ZN24HGDemosaicImplementationD0Ev:
00000000000ddc60	pushq	%rbp
00000000000ddc61	movq	%rsp, %rbp
00000000000ddc64	pushq	%rbx
00000000000ddc65	pushq	%rax
00000000000ddc66	movq	%rdi, %rbx
00000000000ddc69	leaq	0x92f928(%rip), %rax
00000000000ddc70	movq	%rax, (%rdi)
00000000000ddc73	movq	0x38(%rdi), %rdi
00000000000ddc77	testq	%rdi, %rdi
00000000000ddc7a	je	0xddc82
00000000000ddc7c	movq	(%rdi), %rax
00000000000ddc7f	callq	*0x18(%rax)
00000000000ddc82	movq	%rbx, %rdi
00000000000ddc85	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
00000000000ddc8a	movq	%rbx, %rdi
00000000000ddc8d	addq	$0x8, %rsp
00000000000ddc91	popq	%rbx
00000000000ddc92	popq	%rbp
00000000000ddc93	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000ddc98	movq	%rax, %rdi
00000000000ddc9b	callq	___clang_call_terminate
