__ZNK9HGHandler6ScaleYEv:
00000000006ad140	pushq	%rbp
00000000006ad141	movq	%rsp, %rbp
00000000006ad144	subq	$0x10, %rsp
00000000006ad148	movq	%rdi, -0x8(%rbp)
00000000006ad14c	movq	-0x8(%rbp), %rdi
00000000006ad150	addq	$0xdc, %rdi
00000000006ad157	callq	__ZNK6HGTile6HeightEv           ## HGTile::Height() const
00000000006ad15c	movl	%eax, %eax
00000000006ad15e	cvtsi2ss	%rax, %xmm1
00000000006ad163	movss	0x59de5(%rip), %xmm0
00000000006ad16b	divss	%xmm1, %xmm0
00000000006ad16f	addq	$0x10, %rsp
00000000006ad173	popq	%rbp
00000000006ad174	retq
00000000006ad175	nopw	%cs:(%rax,%rax)
