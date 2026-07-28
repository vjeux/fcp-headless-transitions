__ZN22HGTexturePoolingPolicyD2Ev:
0000000000044c60	pushq	%rbp
0000000000044c61	movq	%rsp, %rbp
0000000000044c64	pushq	%rbx
0000000000044c65	pushq	%rax
0000000000044c66	leaq	0x9c29eb(%rip), %rax
0000000000044c6d	movq	%rax, (%rdi)
0000000000044c70	movq	0x10(%rdi), %rax
0000000000044c74	testq	%rax, %rax
0000000000044c77	je	0x44c88
0000000000044c79	movq	(%rax), %rcx
0000000000044c7c	movq	%rdi, %rbx
0000000000044c7f	movq	%rax, %rdi
0000000000044c82	callq	*0x18(%rcx)
0000000000044c85	movq	%rbx, %rdi
0000000000044c88	addq	$0x8, %rsp
0000000000044c8c	popq	%rbx
0000000000044c8d	popq	%rbp
0000000000044c8e	jmp	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
0000000000044c93	movq	%rax, %rdi
0000000000044c96	callq	___clang_call_terminate
0000000000044c9b	nopl	(%rax,%rax)
