__ZN11PCTimeRange12setOffsetEndERK6CMTimeS2_S2_:
00000000002164b0	pushq	%rbp
00000000002164b1	movq	%rsp, %rbp
00000000002164b4	pushq	%r14
00000000002164b6	pushq	%rbx
00000000002164b7	subq	$0x90, %rsp
00000000002164be	movq	%rcx, %r14
00000000002164c1	movq	%rdi, %rbx
00000000002164c4	movq	0x10(%rsi), %rax
00000000002164c8	movq	%rax, 0x10(%rdi)
00000000002164cc	movups	(%rsi), %xmm0
00000000002164cf	movups	%xmm0, (%rdi)
00000000002164d2	movq	0x10(%rdx), %rax
00000000002164d6	movq	%rax, -0x20(%rbp)
00000000002164da	movups	(%rdx), %xmm0
00000000002164dd	movaps	%xmm0, -0x30(%rbp)
00000000002164e1	movq	0x10(%rsi), %rax
00000000002164e5	movq	%rax, -0x40(%rbp)
00000000002164e9	movups	(%rsi), %xmm0
00000000002164ec	movaps	%xmm0, -0x50(%rbp)
00000000002164f0	movq	-0x40(%rbp), %rax
00000000002164f4	movq	%rax, 0x28(%rsp)
00000000002164f9	movaps	-0x50(%rbp), %xmm0
00000000002164fd	movups	%xmm0, 0x18(%rsp)
0000000000216502	movq	-0x20(%rbp), %rax
0000000000216506	movq	%rax, 0x10(%rsp)
000000000021650b	movaps	-0x30(%rbp), %xmm0
000000000021650f	movups	%xmm0, (%rsp)
0000000000216513	leaq	-0x68(%rbp), %rdi
0000000000216517	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
000000000021651c	movq	0x10(%r14), %rax
0000000000216520	movq	%rax, -0x20(%rbp)
0000000000216524	movups	(%r14), %xmm0
0000000000216528	movaps	%xmm0, -0x30(%rbp)
000000000021652c	movq	-0x20(%rbp), %rax
0000000000216530	movq	%rax, 0x28(%rsp)
0000000000216535	movaps	-0x30(%rbp), %xmm0
0000000000216539	movups	%xmm0, 0x18(%rsp)
000000000021653e	movq	-0x58(%rbp), %rax
0000000000216542	movq	%rax, 0x10(%rsp)
0000000000216547	movups	-0x68(%rbp), %xmm0
000000000021654b	movups	%xmm0, (%rsp)
000000000021654f	leaq	-0x50(%rbp), %rdi
0000000000216553	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
0000000000216558	movq	-0x40(%rbp), %rax
000000000021655c	movq	%rax, 0x28(%rbx)
0000000000216560	movups	-0x50(%rbp), %xmm0
0000000000216564	movups	%xmm0, 0x18(%rbx)
0000000000216568	addq	$0x90, %rsp
000000000021656f	popq	%rbx
0000000000216570	popq	%r14
0000000000216572	popq	%rbp
0000000000216573	retq
0000000000216574	nopw	%cs:(%rax,%rax)
