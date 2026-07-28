__ZN13PCSharedMutex6unlockEv:
00000000000ad22a	pushq	%rbp
00000000000ad22b	movq	%rsp, %rbp
00000000000ad22e	pushq	%rbx
00000000000ad22f	pushq	%rax
00000000000ad230	movq	%rdi, %rbx
00000000000ad233	callq	0xde654                         ## symbol stub for: __ZNSt3__15mutex4lockEv
00000000000ad238	movl	0x48(%rbx), %eax
00000000000ad23b	testl	%eax, %eax
00000000000ad23d	je	0xad246
00000000000ad23f	decl	%eax
00000000000ad241	movl	%eax, 0x48(%rbx)
00000000000ad244	jmp	0xad24c
00000000000ad246	xorl	%eax, %eax
00000000000ad248	xchgq	%rax, 0x40(%rbx)
00000000000ad24c	movq	%rbx, %rdi
00000000000ad24f	addq	$0x8, %rsp
00000000000ad253	popq	%rbx
00000000000ad254	popq	%rbp
00000000000ad255	jmp	0xde65a                         ## symbol stub for: __ZNSt3__15mutex6unlockEv
