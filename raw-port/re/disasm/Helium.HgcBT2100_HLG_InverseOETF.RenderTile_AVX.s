__ZN25HgcBT2100_HLG_InverseOETF14RenderTile_AVXEP6HGTile:
00000000003b1660	movl	0xc(%rsi), %eax
00000000003b1663	subl	0x4(%rsi), %eax
00000000003b1666	jle	0x3b1931
00000000003b166c	pushq	%rbp
00000000003b166d	movq	%rsp, %rbp
00000000003b1670	pushq	%r14
00000000003b1672	pushq	%rbx
00000000003b1673	movl	0x8(%rsi), %ecx
00000000003b1676	subl	(%rsi), %ecx
00000000003b1678	movslq	0x18(%rsi), %rdx
00000000003b167c	movq	0x10(%rsi), %r8
00000000003b1680	movq	0x50(%rsi), %r9
00000000003b1684	movslq	0x58(%rsi), %rsi
00000000003b1688	shlq	$0x4, %rdx
00000000003b168c	shlq	$0x4, %rsi
00000000003b1690	xorl	%r10d, %r10d
00000000003b1693	jmp	0x3b16b2
00000000003b1695	nopw	%cs:(%rax,%rax)
00000000003b16a0	addq	%rsi, %r9
00000000003b16a3	addq	%rdx, %r8
00000000003b16a6	incl	%r10d
00000000003b16a9	cmpl	%eax, %r10d
00000000003b16ac	je	0x3b192d
00000000003b16b2	movl	$0x0, %r11d
00000000003b16b8	cmpl	$0x2, %ecx
00000000003b16bb	jl	0x3b1816
00000000003b16c1	movl	$0x10, %ebx
00000000003b16c6	xorl	%r11d, %r11d
00000000003b16c9	nopl	(%rax)
00000000003b16d0	vmovups	-0x10(%r9,%rbx), %ymm0
00000000003b16d7	movq	0x198(%rdi), %r14
00000000003b16de	vmovups	0x40(%r14), %ymm1
00000000003b16e4	vmovups	0x60(%r14), %ymm5
00000000003b16ea	vmovups	0x120(%r14), %ymm2
00000000003b16f3	vmaxps	%ymm1, %ymm0, %ymm6
00000000003b16f7	vbroadcastss	0x20(%r14), %ymm3
00000000003b16fd	vbroadcastss	0x24(%r14), %ymm4
00000000003b1703	vmulps	%ymm3, %ymm6, %ymm3
00000000003b1707	vaddps	%ymm3, %ymm4, %ymm3
00000000003b170b	vblendps	$0x88, %ymm0, %ymm3, %ymm7      ## ymm7 = ymm3[0,1,2],ymm0[3],ymm3[4,5,6],ymm0[7]
00000000003b1711	vmulps	%ymm6, %ymm6, %ymm4
00000000003b1715	vcmpleps	%ymm7, %ymm1, %ymm3
00000000003b171a	vandps	%ymm5, %ymm3, %ymm3
00000000003b171e	vbroadcastss	0x4(%r14), %ymm8
00000000003b1724	vmulps	%ymm4, %ymm8, %ymm4
00000000003b1728	vmaxps	%ymm5, %ymm7, %ymm5
00000000003b172c	vroundps	$0x9, %ymm5, %ymm7
00000000003b1732	vsubps	%ymm7, %ymm5, %ymm5
00000000003b1736	vmulps	0x80(%r14), %ymm5, %ymm8
00000000003b173f	vaddps	0xa0(%r14), %ymm8, %ymm8
00000000003b1748	vmulps	%ymm5, %ymm5, %ymm9
00000000003b174c	vmulps	%ymm8, %ymm9, %ymm8
00000000003b1751	vmulps	0xc0(%r14), %ymm5, %ymm9
00000000003b175a	vblendps	$0x88, %ymm3, %ymm6, %ymm6      ## ymm6 = ymm6[0,1,2],ymm3[3],ymm6[4,5,6],ymm3[7]
00000000003b1760	vaddps	0xe0(%r14), %ymm9, %ymm9
00000000003b1769	vaddps	%ymm9, %ymm8, %ymm8
00000000003b176e	vmulps	%ymm5, %ymm8, %ymm8
00000000003b1772	vaddps	0x100(%r14), %ymm8, %ymm8
00000000003b177b	vmulps	%ymm5, %ymm8, %ymm5
00000000003b177f	vaddps	%ymm5, %ymm2, %ymm5
00000000003b1783	vcvttps2dq	%ymm7, %ymm7
00000000003b1787	vmovdqa	0x140(%r14), %xmm8
00000000003b1790	vpaddd	%xmm7, %xmm8, %xmm9
00000000003b1794	vextractf128	$0x1, %ymm7, %xmm7
00000000003b179a	vpaddd	%xmm7, %xmm8, %xmm7
00000000003b179e	vpslld	$0x17, %xmm9, %xmm8
00000000003b17a4	vpslld	$0x17, %xmm7, %xmm7
00000000003b17a9	vinsertf128	$0x1, %xmm7, %ymm8, %ymm7
00000000003b17af	vmulps	%ymm7, %ymm5, %ymm5
00000000003b17b3	vbroadcastss	0x28(%r14), %ymm7
00000000003b17b9	vmulps	%ymm5, %ymm7, %ymm5
00000000003b17bd	vbroadcastss	0x2c(%r14), %ymm7
00000000003b17c3	vaddps	%ymm5, %ymm7, %ymm5
00000000003b17c7	vbroadcastss	(%r14), %ymm7
00000000003b17cc	vcmpltps	%ymm6, %ymm7, %ymm6
00000000003b17d1	vandps	%ymm2, %ymm6, %ymm2
00000000003b17d5	vblendps	$0x88, %ymm3, %ymm2, %ymm2      ## ymm2 = ymm2[0,1,2],ymm3[3],ymm2[4,5,6],ymm3[7]
00000000003b17db	vcmpltps	%ymm2, %ymm1, %ymm1
00000000003b17e0	vblendvps	%ymm1, %ymm5, %ymm4, %ymm1
00000000003b17e6	vmulps	%ymm0, %ymm3, %ymm0
00000000003b17ea	vblendps	$0x88, %ymm0, %ymm1, %ymm0      ## ymm0 = ymm1[0,1,2],ymm0[3],ymm1[4,5,6],ymm0[7]
00000000003b17f0	vmovups	%ymm0, -0x10(%r8,%rbx)
00000000003b17f7	addq	$0x20, %rbx
00000000003b17fb	movl	%r11d, %r14d
00000000003b17fe	addl	$-0x2, %r11d
00000000003b1802	addl	%ecx, %r14d
00000000003b1805	addl	$-0x2, %r14d
00000000003b1809	cmpl	$0x1, %r14d
00000000003b180d	jg	0x3b16d0
00000000003b1813	negl	%r11d
00000000003b1816	cmpl	%ecx, %r11d
00000000003b1819	jge	0x3b16a0
00000000003b181f	movl	%r11d, %r11d
00000000003b1822	shlq	$0x4, %r11
00000000003b1826	vmovaps	(%r9,%r11), %xmm0
00000000003b182c	movq	0x198(%rdi), %rbx
00000000003b1833	vmovaps	0x40(%rbx), %xmm1
00000000003b1838	vmovaps	0x60(%rbx), %xmm4
00000000003b183d	vmovaps	0x120(%rbx), %xmm2
00000000003b1845	vmaxps	%xmm1, %xmm0, %xmm5
00000000003b1849	vbroadcastss	0x20(%rbx), %xmm3
00000000003b184f	vmulps	%xmm3, %xmm5, %xmm3
00000000003b1853	vbroadcastss	0x24(%rbx), %xmm6
00000000003b1859	vaddps	%xmm3, %xmm6, %xmm3
00000000003b185d	vblendps	$0x8, %xmm0, %xmm3, %xmm6       ## xmm6 = xmm3[0,1,2],xmm0[3]
00000000003b1863	vmulps	%xmm5, %xmm5, %xmm7
00000000003b1867	vcmpleps	%xmm6, %xmm1, %xmm3
00000000003b186c	vandps	%xmm4, %xmm3, %xmm3
00000000003b1870	vblendps	$0x8, %xmm3, %xmm5, %xmm5       ## xmm5 = xmm5[0,1,2],xmm3[3]
00000000003b1876	vbroadcastss	0x4(%rbx), %xmm8
00000000003b187c	vmulps	%xmm7, %xmm8, %xmm7
00000000003b1880	vmaxps	%xmm4, %xmm6, %xmm4
00000000003b1884	vroundps	$0x9, %xmm4, %xmm6
00000000003b188a	vsubps	%xmm6, %xmm4, %xmm4
00000000003b188e	vmulps	0x80(%rbx), %xmm4, %xmm8
00000000003b1896	vaddps	0xa0(%rbx), %xmm8, %xmm8
00000000003b189e	vmulps	%xmm4, %xmm4, %xmm9
00000000003b18a2	vmulps	%xmm8, %xmm9, %xmm8
00000000003b18a7	vmulps	0xc0(%rbx), %xmm4, %xmm9
00000000003b18af	vaddps	0xe0(%rbx), %xmm9, %xmm9
00000000003b18b7	vaddps	%xmm9, %xmm8, %xmm8
00000000003b18bc	vmulps	%xmm4, %xmm8, %xmm8
00000000003b18c0	vaddps	0x100(%rbx), %xmm8, %xmm8
00000000003b18c8	vmulps	%xmm4, %xmm8, %xmm4
00000000003b18cc	vaddps	%xmm4, %xmm2, %xmm4
00000000003b18d0	vcvttps2dq	%xmm6, %xmm6
00000000003b18d4	vpaddd	0x140(%rbx), %xmm6, %xmm6
00000000003b18dc	vpslld	$0x17, %xmm6, %xmm6
00000000003b18e1	vmulps	%xmm6, %xmm4, %xmm4
00000000003b18e5	vbroadcastss	0x28(%rbx), %xmm6
00000000003b18eb	vmulps	%xmm4, %xmm6, %xmm4
00000000003b18ef	vbroadcastss	0x2c(%rbx), %xmm6
00000000003b18f5	vaddps	%xmm4, %xmm6, %xmm4
00000000003b18f9	vbroadcastss	(%rbx), %xmm6
00000000003b18fe	vcmpltps	%xmm5, %xmm6, %xmm5
00000000003b1903	vandps	%xmm2, %xmm5, %xmm2
00000000003b1907	vblendps	$0x8, %xmm3, %xmm2, %xmm2       ## xmm2 = xmm2[0,1,2],xmm3[3]
00000000003b190d	vcmpnleps	%xmm1, %xmm2, %xmm1
00000000003b1912	vblendvps	%xmm1, %xmm4, %xmm7, %xmm1
00000000003b1918	vmulps	%xmm0, %xmm3, %xmm0
00000000003b191c	vblendps	$0x8, %xmm0, %xmm1, %xmm0       ## xmm0 = xmm1[0,1,2],xmm0[3]
00000000003b1922	vmovaps	%xmm0, (%r8,%r11)
00000000003b1928	jmp	0x3b16a0
00000000003b192d	popq	%rbx
00000000003b192e	popq	%r14
00000000003b1930	popq	%rbp
00000000003b1931	vzeroupper
00000000003b1934	xorl	%eax, %eax
00000000003b1936	retq
00000000003b1937	nopw	(%rax,%rax)
