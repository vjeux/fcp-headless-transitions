__ZN25HgcCopyMaskRGBToMaskAlpha12SetParameterEiffff:
00000000006a2d70	pushq	%rbp
00000000006a2d71	movq	%rsp, %rbp
00000000006a2d74	movq	%rdi, -0x8(%rbp)
00000000006a2d78	movl	%esi, -0xc(%rbp)
00000000006a2d7b	movss	%xmm0, -0x10(%rbp)
00000000006a2d80	movss	%xmm1, -0x14(%rbp)
00000000006a2d85	movss	%xmm2, -0x18(%rbp)
00000000006a2d8a	movss	%xmm3, -0x1c(%rbp)
00000000006a2d8f	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000006a2d94	popq	%rbp
00000000006a2d95	retq
00000000006a2d96	nopw	%cs:(%rax,%rax)
