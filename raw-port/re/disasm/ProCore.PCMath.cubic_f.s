__ZN6PCMath5cubicEfffRfS0_S0_:
0000000000012e8f	pushq	%rbp
0000000000012e90	movq	%rsp, %rbp
0000000000012e93	pushq	%r15
0000000000012e95	pushq	%r14
0000000000012e97	pushq	%rbx
0000000000012e98	subq	$0x28, %rsp
0000000000012e9c	cvtss2sd	%xmm0, %xmm5
0000000000012ea0	mulss	%xmm0, %xmm0
0000000000012ea4	cvtss2sd	%xmm0, %xmm0
0000000000012ea8	cvtss2sd	%xmm1, %xmm1
0000000000012eac	movsd	0x10f7ac(%rip), %xmm3
0000000000012eb4	mulsd	%xmm1, %xmm3
0000000000012eb8	addsd	%xmm0, %xmm3
0000000000012ebc	movaps	%xmm5, %xmm6
0000000000012ebf	addsd	%xmm5, %xmm6
0000000000012ec3	mulsd	%xmm5, %xmm6
0000000000012ec7	mulsd	%xmm5, %xmm6
0000000000012ecb	movsd	0x10fbc5(%rip), %xmm4
0000000000012ed3	movsd	%xmm5, -0x20(%rbp)
0000000000012ed8	mulsd	%xmm5, %xmm4
0000000000012edc	mulsd	%xmm1, %xmm4
0000000000012ee0	subsd	%xmm4, %xmm6
0000000000012ee4	xorps	%xmm0, %xmm0
0000000000012ee7	cvtss2sd	%xmm2, %xmm0
0000000000012eeb	mulsd	0x10fb9d(%rip), %xmm0
0000000000012ef3	addsd	%xmm6, %xmm0
0000000000012ef7	unpcklpd	%xmm3, %xmm0                    ## xmm0 = xmm0[0],xmm3[0]
0000000000012efb	divpd	0x10fc3d(%rip), %xmm0
0000000000012f03	movq	%rdi, %rbx
0000000000012f06	movapd	%xmm0, %xmm1
0000000000012f0a	unpckhpd	%xmm0, %xmm1                    ## xmm1 = xmm1[1],xmm0[1]
0000000000012f0e	movapd	%xmm1, -0x30(%rbp)
0000000000012f13	mulsd	%xmm1, %xmm1
0000000000012f17	movapd	%xmm0, %xmm3
0000000000012f1b	unpcklpd	%xmm1, %xmm3                    ## xmm3 = xmm3[0],xmm1[0]
0000000000012f1f	mulpd	%xmm0, %xmm3
0000000000012f23	movapd	%xmm3, %xmm1
0000000000012f27	unpckhpd	%xmm3, %xmm1                    ## xmm1 = xmm1[1],xmm3[1]
0000000000012f2b	ucomisd	%xmm3, %xmm1
0000000000012f2f	jbe	0x13011
0000000000012f35	movq	%rdx, %r15
0000000000012f38	movq	%rsi, %r14
0000000000012f3b	sqrtsd	%xmm1, %xmm1
0000000000012f3f	divsd	%xmm1, %xmm0
0000000000012f43	callq	0xde774                         ## symbol stub for: _acos
0000000000012f48	xorps	%xmm1, %xmm1
0000000000012f4b	sqrtsd	-0x30(%rbp), %xmm1
0000000000012f50	mulsd	0x10fb48(%rip), %xmm1
0000000000012f58	movsd	%xmm1, -0x30(%rbp)
0000000000012f5d	movsd	%xmm0, -0x40(%rbp)
0000000000012f62	divsd	0x10f6be(%rip), %xmm0
0000000000012f6a	callq	0xde7ce                         ## symbol stub for: _cos
0000000000012f6f	mulsd	-0x30(%rbp), %xmm0
0000000000012f74	movsd	-0x20(%rbp), %xmm2
0000000000012f79	movsd	0x10f6a7(%rip), %xmm1
0000000000012f81	divsd	%xmm1, %xmm2
0000000000012f85	movsd	%xmm2, -0x20(%rbp)
0000000000012f8a	subsd	%xmm2, %xmm0
0000000000012f8e	cvtsd2ss	%xmm0, %xmm0
0000000000012f92	movss	%xmm0, (%rbx)
0000000000012f96	movsd	0x10f5c2(%rip), %xmm0
0000000000012f9e	addsd	-0x40(%rbp), %xmm0
0000000000012fa3	divsd	%xmm1, %xmm0
0000000000012fa7	callq	0xde7ce                         ## symbol stub for: _cos
0000000000012fac	mulsd	-0x30(%rbp), %xmm0
0000000000012fb1	subsd	-0x20(%rbp), %xmm0
0000000000012fb6	cvtsd2ss	%xmm0, %xmm0
0000000000012fba	movss	%xmm0, (%r14)
0000000000012fbf	movsd	-0x40(%rbp), %xmm0
0000000000012fc4	addsd	0x10fadc(%rip), %xmm0
0000000000012fcc	divsd	0x10f654(%rip), %xmm0
0000000000012fd4	callq	0xde7ce                         ## symbol stub for: _cos
0000000000012fd9	mulsd	-0x30(%rbp), %xmm0
0000000000012fde	subsd	-0x20(%rbp), %xmm0
0000000000012fe3	cvtsd2ss	%xmm0, %xmm0
0000000000012fe7	movss	%xmm0, (%r15)
0000000000012fec	movss	(%rbx), %xmm1
0000000000012ff0	movss	(%r14), %xmm2
0000000000012ff5	ucomiss	%xmm2, %xmm1
0000000000012ff8	jbe	0x130a0
0000000000012ffe	movss	%xmm2, (%rbx)
0000000000013002	movss	%xmm1, (%r14)
0000000000013007	movss	(%r15), %xmm0
000000000001300c	jmp	0x130a3
0000000000013011	movapd	%xmm0, %xmm2
0000000000013015	movapd	%xmm0, -0x40(%rbp)
000000000001301a	andpd	0x10f64e(%rip), %xmm2
0000000000013022	subsd	%xmm1, %xmm3
0000000000013026	xorps	%xmm0, %xmm0
0000000000013029	sqrtsd	%xmm3, %xmm0
000000000001302d	addsd	%xmm2, %xmm0
0000000000013031	movsd	0x10f5af(%rip), %xmm1
0000000000013039	callq	0xdea4a                         ## symbol stub for: _pow
000000000001303e	movapd	0x10f62a(%rip), %xmm2
0000000000013046	andpd	%xmm2, %xmm0
000000000001304a	andnpd	-0x40(%rbp), %xmm2
000000000001304f	orpd	%xmm0, %xmm2
0000000000013053	movapd	0xcf015(%rip), %xmm1
000000000001305b	xorpd	%xmm2, %xmm1
000000000001305f	movapd	%xmm2, %xmm3
0000000000013063	movapd	-0x30(%rbp), %xmm2
0000000000013068	divsd	%xmm1, %xmm2
000000000001306c	cmpltsd	0x10f80b(%rip), %xmm0
0000000000013075	andnpd	%xmm2, %xmm0
0000000000013079	subsd	%xmm3, %xmm0
000000000001307d	movsd	-0x20(%rbp), %xmm1
0000000000013082	divsd	0x10f5d6(%rip), %xmm1
000000000001308a	addsd	%xmm0, %xmm1
000000000001308e	xorps	%xmm0, %xmm0
0000000000013091	cvtsd2ss	%xmm1, %xmm0
0000000000013095	movss	%xmm0, (%rbx)
0000000000013099	movl	$0x1, %eax
000000000001309e	jmp	0x130ce
00000000000130a0	movaps	%xmm2, %xmm1
00000000000130a3	movl	$0x3, %eax
00000000000130a8	ucomiss	%xmm0, %xmm1
00000000000130ab	jbe	0x130ce
00000000000130ad	movss	%xmm0, (%r14)
00000000000130b2	movss	%xmm1, (%r15)
00000000000130b7	movss	(%rbx), %xmm0
00000000000130bb	movss	(%r14), %xmm1
00000000000130c0	ucomiss	%xmm1, %xmm0
00000000000130c3	jbe	0x130ce
00000000000130c5	movss	%xmm1, (%rbx)
00000000000130c9	movss	%xmm0, (%r14)
00000000000130ce	addq	$0x28, %rsp
00000000000130d2	popq	%rbx
00000000000130d3	popq	%r14
00000000000130d5	popq	%r15
00000000000130d7	popq	%rbp
00000000000130d8	retq
