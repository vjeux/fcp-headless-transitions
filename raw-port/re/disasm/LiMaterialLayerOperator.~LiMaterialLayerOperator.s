__ZN23LiMaterialLayerOperatorD0Ev:
00000000001e3100	pushq	%rbp
00000000001e3101	movq	%rsp, %rbp
00000000001e3104	pushq	%rbx
00000000001e3105	pushq	%rax
00000000001e3106	movq	%rdi, %rbx
00000000001e3109	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
00000000001e3110	addq	$0x10, %rax
00000000001e3114	movq	%rax, 0x8(%rdi)
00000000001e3118	movq	0x10(%rdi), %rdi
00000000001e311c	testq	%rdi, %rdi
00000000001e311f	je	0x1e3126
00000000001e3121	callq	0x6de4fc                        ## symbol stub for: __ZN18PC_Sp_counted_base12weak_releaseEv
00000000001e3126	movq	%rbx, %rdi
00000000001e3129	addq	$0x8, %rsp
00000000001e312d	popq	%rbx
00000000001e312e	popq	%rbp
00000000001e312f	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000001e3134	movq	%rax, %rdi
00000000001e3137	callq	___clang_call_terminate
00000000001e313c	nopl	(%rax)
