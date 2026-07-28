// Extracted from /tmp/Ozone_tV.txt lines 186823-186878.
__ZN14PCBlendOptionsD1Ev:                                          // @0xacc10
00000000000acc10	pushq	%rbp
00000000000acc11	movq	%rsp, %rbp
00000000000acc14	pushq	%rbx
00000000000acc15	pushq	%rax
00000000000acc16	movq	%rdi, %rbx
00000000000acc19	leaq	__ZTV14PCBlendOptions(%rip), %rax ## vtable for PCBlendOptions
00000000000acc20	leaq	0x18(%rax), %rcx
00000000000acc24	movq	%rcx, (%rdi)
00000000000acc27	addq	$0x48, %rax
00000000000acc2b	movq	%rax, 0x20(%rdi)
00000000000acc2f	addq	$0x18, %rdi
00000000000acc33	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000000acc38	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
00000000000acc3f	addq	$0x10, %rax
00000000000acc43	movq	%rax, 0x20(%rbx)
00000000000acc47	movq	0x28(%rbx), %rdi
00000000000acc4b	testq	%rdi, %rdi
00000000000acc4e	je	0xacc55
00000000000acc50	callq	0x6de4fc                        ## symbol stub for: __ZN18PC_Sp_counted_base12weak_releaseEv
00000000000acc55	addq	$0x8, %rsp
00000000000acc59	popq	%rbx
00000000000acc5a	popq	%rbp
00000000000acc5b	retq
00000000000acc5c	movq	%rax, %rdi
00000000000acc5f	callq	___clang_call_terminate
00000000000acc64	nopw	%cs:(%rax,%rax)
__ZN14PCBlendOptionsD0Ev:                                          // @0xacc70
00000000000acc70	pushq	%rbp
00000000000acc71	movq	%rsp, %rbp
00000000000acc74	pushq	%rbx
00000000000acc75	pushq	%rax
00000000000acc76	movq	%rdi, %rbx
00000000000acc79	leaq	__ZTV14PCBlendOptions(%rip), %rax
00000000000acc80	leaq	0x18(%rax), %rcx
00000000000acc84	movq	%rcx, (%rdi)
00000000000acc87	addq	$0x48, %rax
00000000000acc8b	movq	%rax, 0x20(%rdi)
00000000000acc8f	addq	$0x18, %rdi
00000000000acc93	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000000acc98	leaq	__ZTV13PCShared_base(%rip), %rax
00000000000acc9f	addq	$0x10, %rax
00000000000acca3	movq	%rax, 0x20(%rbx)
00000000000acca7	movq	0x28(%rbx), %rdi
00000000000accab	testq	%rdi, %rdi
00000000000accae	je	0xaccb5
00000000000accb0	callq	0x6de4fc
00000000000accb5	movq	%rbx, %rdi
00000000000accb8	addq	$0x8, %rsp
00000000000accbc	popq	%rbx
00000000000accbd	popq	%rbp
00000000000accbe	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000000accc3	movq	%rax, %rdi
00000000000accc6	callq	___clang_call_terminate
00000000000acccb	nopl	(%rax,%rax)
