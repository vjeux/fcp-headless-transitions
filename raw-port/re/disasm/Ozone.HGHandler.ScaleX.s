__ZNK9HGHandler6ScaleXEv:
00000000006ad100	pushq	%rbp
00000000006ad101	movq	%rsp, %rbp
00000000006ad104	subq	$0x10, %rsp
00000000006ad108	movq	%rdi, -0x8(%rbp)
00000000006ad10c	movq	-0x8(%rbp), %rdi
00000000006ad110	addq	$0xdc, %rdi
00000000006ad117	callq	__ZNK6HGRect1wEv                ## HGRect::w() const
00000000006ad11c	movl	%eax, %eax
00000000006ad11e	cvtsi2ss	%rax, %xmm1
00000000006ad123	movss	0x59e25(%rip), %xmm0
00000000006ad12b	divss	%xmm1, %xmm0
00000000006ad12f	addq	$0x10, %rsp
00000000006ad133	popq	%rbp
00000000006ad134	retq
00000000006ad135	nopw	%cs:(%rax,%rax)
