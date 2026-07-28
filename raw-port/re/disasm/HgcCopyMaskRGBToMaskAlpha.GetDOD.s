__ZN25HgcCopyMaskRGBToMaskAlpha6GetDODEP10HGRendereri6HGRect:
00000000006a2af0	pushq	%rbp
00000000006a2af1	movq	%rsp, %rbp
00000000006a2af4	movq	%rcx, -0x20(%rbp)
00000000006a2af8	movq	%r8, -0x18(%rbp)
00000000006a2afc	movq	%rdi, -0x28(%rbp)
00000000006a2b00	movq	%rsi, -0x30(%rbp)
00000000006a2b04	movl	%edx, -0x34(%rbp)
00000000006a2b07	movl	-0x34(%rbp), %eax
00000000006a2b0a	testl	%eax, %eax
00000000006a2b0c	jne	0x6a2b22
00000000006a2b0e	jmp	0x6a2b10
00000000006a2b10	movq	-0x20(%rbp), %rax
00000000006a2b14	movq	%rax, -0x10(%rbp)
00000000006a2b18	movq	-0x18(%rbp), %rax
00000000006a2b1c	movq	%rax, -0x8(%rbp)
00000000006a2b20	jmp	0x6a2b38
00000000006a2b22	movq	0x17e1f7(%rip), %rax            ## literal pool symbol address: _HGRectNull
00000000006a2b29	movq	(%rax), %rcx
00000000006a2b2c	movq	%rcx, -0x10(%rbp)
00000000006a2b30	movq	0x8(%rax), %rax
00000000006a2b34	movq	%rax, -0x8(%rbp)
00000000006a2b38	movq	-0x10(%rbp), %rax
00000000006a2b3c	movq	-0x8(%rbp), %rdx
00000000006a2b40	popq	%rbp
00000000006a2b41	retq
00000000006a2b42	nopw	%cs:(%rax,%rax)
