__ZN17OZWriteOnBehavior7didBakeEv:
00000000004777d0	pushq	%rbp
00000000004777d1	movq	%rsp, %rbp
00000000004777d4	movq	0x810(%rdi), %rax
00000000004777db	movq	0x828(%rdi), %rcx
00000000004777e2	movq	%rax, 0x818(%rdi)
00000000004777e9	movq	%rcx, 0x830(%rdi)
00000000004777f0	movq	0x3acd19(%rip), %rax            ## literal pool symbol address: _kCMTimeZero
00000000004777f7	movups	(%rax), %xmm0
00000000004777fa	movups	%xmm0, 0x840(%rdi)
0000000000477801	movq	0x10(%rax), %rax
0000000000477805	movq	%rax, 0x850(%rdi)
000000000047780c	movb	$0x0, 0x138(%rdi)
0000000000477813	popq	%rbp
0000000000477814	retq
0000000000477815	nopw	%cs:(%rax,%rax)
