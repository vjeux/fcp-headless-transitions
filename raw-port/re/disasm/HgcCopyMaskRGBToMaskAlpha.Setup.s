__ZN25HgcCopyMaskRGBToMaskAlpha5SetupEPv:
00000000006a1f40	pushq	%rbp
00000000006a1f41	movq	%rsp, %rbp
00000000006a1f44	movq	%rdi, -0x18(%rbp)
00000000006a1f48	movq	%rsi, -0x20(%rbp)
00000000006a1f4c	movq	-0x18(%rbp), %rax
00000000006a1f50	movq	0x1f0(%rax), %rcx
00000000006a1f57	movaps	0x80(%rcx), %xmm0
00000000006a1f5e	movaps	%xmm0, -0x30(%rbp)
00000000006a1f62	movq	0x1f0(%rax), %rcx
00000000006a1f69	movaps	0xa0(%rcx), %xmm0
00000000006a1f70	movaps	%xmm0, -0x40(%rbp)
00000000006a1f74	movq	0x1f0(%rax), %rcx
00000000006a1f7b	movaps	0xc0(%rcx), %xmm0
00000000006a1f82	movaps	%xmm0, -0x50(%rbp)
00000000006a1f86	xorps	%xmm0, %xmm0
00000000006a1f89	movaps	%xmm0, -0x10(%rbp)
00000000006a1f8d	movaps	-0x10(%rbp), %xmm0
00000000006a1f91	movaps	%xmm0, -0x60(%rbp)
00000000006a1f95	movaps	-0x30(%rbp), %xmm0
00000000006a1f99	shufps	$0x24, %xmm0, %xmm0             ## xmm0 = xmm0[0,1,2,0]
00000000006a1f9d	movaps	%xmm0, -0x30(%rbp)
00000000006a1fa1	movaps	-0x40(%rbp), %xmm0
00000000006a1fa5	shufps	$0x24, %xmm0, %xmm0             ## xmm0 = xmm0[0,1,2,0]
00000000006a1fa9	movaps	%xmm0, -0x40(%rbp)
00000000006a1fad	movaps	-0x50(%rbp), %xmm0
00000000006a1fb1	shufps	$0x24, %xmm0, %xmm0             ## xmm0 = xmm0[0,1,2,0]
00000000006a1fb5	movaps	%xmm0, -0x50(%rbp)
00000000006a1fb9	movaps	-0x60(%rbp), %xmm0
00000000006a1fbd	shufps	$0x24, %xmm0, %xmm0             ## xmm0 = xmm0[0,1,2,0]
00000000006a1fc1	movaps	%xmm0, -0x60(%rbp)
00000000006a1fc5	movaps	-0x30(%rbp), %xmm0
00000000006a1fc9	movq	0x1f0(%rax), %rcx
00000000006a1fd0	movaps	%xmm0, 0x10(%rcx)
00000000006a1fd4	movq	0x1f0(%rax), %rcx
00000000006a1fdb	movaps	%xmm0, (%rcx)
00000000006a1fde	movaps	-0x40(%rbp), %xmm0
00000000006a1fe2	movq	0x1f0(%rax), %rcx
00000000006a1fe9	movaps	%xmm0, 0x30(%rcx)
00000000006a1fed	movq	0x1f0(%rax), %rcx
00000000006a1ff4	movaps	%xmm0, 0x20(%rcx)
00000000006a1ff8	movaps	-0x50(%rbp), %xmm0
00000000006a1ffc	movq	0x1f0(%rax), %rcx
00000000006a2003	movaps	%xmm0, 0x50(%rcx)
00000000006a2007	movq	0x1f0(%rax), %rcx
00000000006a200e	movaps	%xmm0, 0x40(%rcx)
00000000006a2012	movaps	-0x60(%rbp), %xmm0
00000000006a2016	movq	0x1f0(%rax), %rcx
00000000006a201d	movaps	%xmm0, 0x70(%rcx)
00000000006a2021	movq	0x1f0(%rax), %rax
00000000006a2028	movaps	%xmm0, 0x60(%rax)
00000000006a202c	xorl	%eax, %eax
00000000006a202e	popq	%rbp
00000000006a202f	retq
