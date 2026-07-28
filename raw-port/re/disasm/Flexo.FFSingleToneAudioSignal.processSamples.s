__ZNK23FFSingleToneAudioSignal14processSamplesEPfyy:
0000000001258f70	testq	%rcx, %rcx
0000000001258f73	je	0x12591c2
0000000001258f79	pushq	%rbp
0000000001258f7a	movq	%rsp, %rbp
0000000001258f7d	pushq	%r15
0000000001258f7f	pushq	%r14
0000000001258f81	pushq	%r13
0000000001258f83	pushq	%r12
0000000001258f85	pushq	%rbx
0000000001258f86	subq	$0xa8, %rsp
0000000001258f8d	movq	%rcx, %rbx
0000000001258f90	movq	%rdx, %r14
0000000001258f93	movq	%rsi, %r15
0000000001258f96	movsd	0x20(%rdi), %xmm1
0000000001258f9b	mulsd	0x3195b5(%rip), %xmm1
0000000001258fa3	divsd	0x30(%rdi), %xmm1
0000000001258fa8	movsd	0x28(%rdi), %xmm0
0000000001258fad	cmpq	$0x4, %rcx
0000000001258fb1	movapd	%xmm1, -0x60(%rbp)
0000000001258fb6	movapd	%xmm0, -0xb0(%rbp)
0000000001258fbe	jae	0x1258fcc
0000000001258fc0	xorl	%r12d, %r12d
0000000001258fc3	movapd	%xmm1, %xmm2
0000000001258fc7	jmp	0x1259160
0000000001258fcc	movq	%rbx, %r12
0000000001258fcf	andq	$-0x4, %r12
0000000001258fd3	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
0000000001258fd7	movapd	%xmm0, -0xa0(%rbp)
0000000001258fdf	movq	%r14, %xmm0
0000000001258fe4	pshufd	$0x44, %xmm0, %xmm0             ## xmm0 = xmm0[0,1,0,1]
0000000001258fe9	movdqa	%xmm0, -0x90(%rbp)
0000000001258ff1	movddup	%xmm1, %xmm0                    ## xmm0 = xmm1[0,0]
0000000001258ff5	movapd	%xmm0, -0x80(%rbp)
0000000001258ffa	movdqa	0x32a50e(%rip), %xmm0
0000000001259002	movdqa	0x32a516(%rip), %xmm1
000000000125900a	xorl	%r13d, %r13d
000000000125900d	nopl	(%rax)
0000000001259010	movdqa	%xmm1, -0xc0(%rbp)
0000000001259018	movdqa	%xmm0, -0xd0(%rbp)
0000000001259020	movdqa	%xmm0, %xmm5
0000000001259024	movdqa	-0x90(%rbp), %xmm0
000000000125902c	paddq	%xmm0, %xmm5
0000000001259030	movdqa	%xmm1, %xmm6
0000000001259034	paddq	%xmm0, %xmm6
0000000001259038	movdqa	%xmm6, %xmm0
000000000125903c	pxor	%xmm1, %xmm1
0000000001259040	pblendw	$0xcc, %xmm1, %xmm0             ## xmm0 = xmm0[0,1],xmm1[2,3],xmm0[4,5],xmm1[6,7]
0000000001259046	movdqa	0x3164b2(%rip), %xmm2
000000000125904e	por	%xmm2, %xmm0
0000000001259052	psrlq	$0x20, %xmm6
0000000001259057	movdqa	0x3164b1(%rip), %xmm3
000000000125905f	por	%xmm3, %xmm6
0000000001259063	movapd	0x3164b5(%rip), %xmm4
000000000125906b	subpd	%xmm4, %xmm6
000000000125906f	addpd	%xmm0, %xmm6
0000000001259073	movdqa	%xmm5, %xmm0
0000000001259077	pblendw	$0xcc, %xmm1, %xmm0             ## xmm0 = xmm0[0,1],xmm1[2,3],xmm0[4,5],xmm1[6,7]
000000000125907d	por	%xmm2, %xmm0
0000000001259081	psrlq	$0x20, %xmm5
0000000001259086	por	%xmm3, %xmm5
000000000125908a	subpd	%xmm4, %xmm5
000000000125908e	addpd	%xmm0, %xmm5
0000000001259092	movapd	-0x80(%rbp), %xmm0
0000000001259097	mulpd	%xmm0, %xmm5
000000000125909b	movapd	%xmm5, -0x70(%rbp)
00000000012590a0	mulpd	%xmm0, %xmm6
00000000012590a4	movapd	%xmm6, -0x40(%rbp)
00000000012590a9	movapd	%xmm6, %xmm0
00000000012590ad	callq	0x1497bae                       ## symbol stub for: _sin
00000000012590b2	movapd	%xmm0, -0x50(%rbp)
00000000012590b7	movaps	-0x40(%rbp), %xmm0
00000000012590bb	movhlps	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1]
00000000012590be	callq	0x1497bae                       ## symbol stub for: _sin
00000000012590c3	movaps	-0x50(%rbp), %xmm1
00000000012590c7	movlhps	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
00000000012590ca	movaps	%xmm1, -0x50(%rbp)
00000000012590ce	movaps	-0x70(%rbp), %xmm0
00000000012590d2	callq	0x1497bae                       ## symbol stub for: _sin
00000000012590d7	movaps	%xmm0, -0x40(%rbp)
00000000012590db	movapd	-0x70(%rbp), %xmm0
00000000012590e0	unpckhpd	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1]
00000000012590e4	callq	0x1497bae                       ## symbol stub for: _sin
00000000012590e9	movapd	-0x40(%rbp), %xmm1
00000000012590ee	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
00000000012590f2	movapd	-0xa0(%rbp), %xmm0
00000000012590fa	mulpd	%xmm0, %xmm1
00000000012590fe	movapd	%xmm1, %xmm2
0000000001259102	movapd	-0x50(%rbp), %xmm1
0000000001259107	mulpd	%xmm0, %xmm1
000000000125910b	cvtpd2ps	%xmm1, %xmm0
000000000125910f	cvtpd2ps	%xmm2, %xmm1
0000000001259113	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
0000000001259117	movdqa	-0xc0(%rbp), %xmm1
000000000125911f	movupd	%xmm0, (%r15,%r13,4)
0000000001259125	movdqa	-0xd0(%rbp), %xmm0
000000000125912d	addq	$0x4, %r13
0000000001259131	movdqa	0x32a3f7(%rip), %xmm2
0000000001259139	paddq	%xmm2, %xmm1
000000000125913d	paddq	%xmm2, %xmm0
0000000001259141	cmpq	%r13, %r12
0000000001259144	jne	0x1259010
000000000125914a	cmpq	%r12, %rbx
000000000125914d	movapd	-0x60(%rbp), %xmm2
0000000001259152	je	0x12591b1
0000000001259154	nopw	%cs:(%rax,%rax)
0000000001259160	leaq	(%r14,%r12), %rax
0000000001259164	movq	%rax, %xmm1
0000000001259169	punpckldq	0x31396f(%rip), %xmm1   ## xmm1 = xmm1[0],mem[0],xmm1[1],mem[1]
0000000001259171	subpd	0x313977(%rip), %xmm1
0000000001259179	movapd	%xmm1, %xmm0
000000000125917d	unpckhpd	%xmm1, %xmm0                    ## xmm0 = xmm0[1],xmm1[1]
0000000001259181	addsd	%xmm1, %xmm0
0000000001259185	mulsd	%xmm2, %xmm0
0000000001259189	callq	0x1497bae                       ## symbol stub for: _sin
000000000125918e	movapd	-0xb0(%rbp), %xmm1
0000000001259196	movapd	-0x60(%rbp), %xmm2
000000000125919b	mulsd	%xmm1, %xmm0
000000000125919f	cvtsd2ss	%xmm0, %xmm0
00000000012591a3	movss	%xmm0, (%r15,%r12,4)
00000000012591a9	incq	%r12
00000000012591ac	cmpq	%r12, %rbx
00000000012591af	jne	0x1259160
00000000012591b1	addq	$0xa8, %rsp
00000000012591b8	popq	%rbx
00000000012591b9	popq	%r12
00000000012591bb	popq	%r13
00000000012591bd	popq	%r14
00000000012591bf	popq	%r15
00000000012591c1	popq	%rbp
00000000012591c2	retq
00000000012591c3	nopw	%cs:(%rax,%rax)
