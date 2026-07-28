__ZN25HgcCopyMaskRGBToMaskAlpha6GetROIEP10HGRendereri6HGRect:
00000000006a2b50	pushq	%rbp
00000000006a2b51	movq	%rsp, %rbp
00000000006a2b54	movq	%rcx, -0x20(%rbp)
00000000006a2b58	movq	%r8, -0x18(%rbp)
00000000006a2b5c	movq	%rdi, -0x28(%rbp)
00000000006a2b60	movq	%rsi, -0x30(%rbp)
00000000006a2b64	movl	%edx, -0x34(%rbp)
00000000006a2b67	movl	-0x34(%rbp), %eax
00000000006a2b6a	testl	%eax, %eax
00000000006a2b6c	jne	0x6a2b82
00000000006a2b6e	jmp	0x6a2b70
00000000006a2b70	movq	-0x20(%rbp), %rax
00000000006a2b74	movq	%rax, -0x10(%rbp)
00000000006a2b78	movq	-0x18(%rbp), %rax
00000000006a2b7c	movq	%rax, -0x8(%rbp)
00000000006a2b80	jmp	0x6a2b98
00000000006a2b82	movq	0x17e197(%rip), %rax            ## literal pool symbol address: _HGRectNull
00000000006a2b89	movq	(%rax), %rcx
00000000006a2b8c	movq	%rcx, -0x10(%rbp)
00000000006a2b90	movq	0x8(%rax), %rax
00000000006a2b94	movq	%rax, -0x8(%rbp)
00000000006a2b98	movq	-0x10(%rbp), %rax
00000000006a2b9c	movq	-0x8(%rbp), %rdx
00000000006a2ba0	popq	%rbp
00000000006a2ba1	retq
00000000006a2ba2	nopw	%cs:(%rax,%rax)
