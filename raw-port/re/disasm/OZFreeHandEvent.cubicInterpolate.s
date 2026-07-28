__ZN15OZFreeHandEvent16cubicInterpolateEdPS_i:
00000000003dd230	pushq	%rbp
00000000003dd231	movq	%rsp, %rbp
00000000003dd234	leal	0x3(%rdx), %ecx
00000000003dd237	leal	0x6(%rdx), %r8d
00000000003dd23b	testl	%ecx, %ecx
00000000003dd23d	cmovnsl	%ecx, %r8d
00000000003dd241	movq	%rdi, %rax
00000000003dd244	andl	$-0x4, %r8d
00000000003dd248	negl	%r8d
00000000003dd24b	leal	0x2(%rdx), %edi
00000000003dd24e	leal	0x5(%rdx), %r9d
00000000003dd252	testl	%edi, %edi
00000000003dd254	cmovnsl	%edi, %r9d
00000000003dd258	leal	(%rdx,%r8), %edi
00000000003dd25c	addl	$0x3, %edi
00000000003dd25f	andl	$-0x4, %r9d
00000000003dd263	negl	%r9d
00000000003dd266	leal	0x1(%rdx), %r8d
00000000003dd26a	leal	0x4(%rdx), %r10d
00000000003dd26e	testl	%r8d, %r8d
00000000003dd271	cmovnsl	%r8d, %r10d
00000000003dd275	leal	(%rdx,%r9), %r8d
00000000003dd279	addl	$0x2, %r8d
00000000003dd27d	andl	$-0x4, %r10d
00000000003dd281	negl	%r10d
00000000003dd284	leal	(%rdx,%r10), %r9d
00000000003dd288	incl	%r9d
00000000003dd28b	testl	%edx, %edx
00000000003dd28d	cmovnsl	%edx, %ecx
00000000003dd290	andl	$-0x4, %ecx
00000000003dd293	subl	%ecx, %edx
00000000003dd295	movslq	%edi, %rcx
00000000003dd298	leaq	(%rcx,%rcx,2), %rcx
00000000003dd29c	shlq	$0x4, %rcx
00000000003dd2a0	movslq	%r8d, %rdi
00000000003dd2a3	leaq	(%rdi,%rdi,2), %rdi
00000000003dd2a7	shlq	$0x4, %rdi
00000000003dd2ab	movslq	%r9d, %r8
00000000003dd2ae	leaq	(%r8,%r8,2), %r8
00000000003dd2b2	shlq	$0x4, %r8
00000000003dd2b6	movslq	%edx, %rdx
00000000003dd2b9	leaq	(%rdx,%rdx,2), %rdx
00000000003dd2bd	movapd	%xmm0, %xmm5
00000000003dd2c1	mulsd	%xmm0, %xmm5
00000000003dd2c5	movapd	%xmm0, %xmm3
00000000003dd2c9	mulsd	%xmm5, %xmm3
00000000003dd2cd	movapd	%xmm3, %xmm6
00000000003dd2d1	addsd	%xmm3, %xmm6
00000000003dd2d5	movsd	0x329bfb(%rip), %xmm4
00000000003dd2dd	mulsd	%xmm5, %xmm4
00000000003dd2e1	movapd	%xmm6, %xmm1
00000000003dd2e5	subsd	%xmm4, %xmm1
00000000003dd2e9	addsd	0x3280ef(%rip), %xmm1
00000000003dd2f1	shlq	$0x4, %rdx
00000000003dd2f5	movapd	%xmm3, %xmm2
00000000003dd2f9	subsd	%xmm5, %xmm3
00000000003dd2fd	addsd	%xmm5, %xmm5
00000000003dd301	subsd	%xmm5, %xmm2
00000000003dd305	addsd	%xmm0, %xmm2
00000000003dd309	subsd	%xmm6, %xmm4
00000000003dd30d	movupd	(%rsi,%rcx), %xmm0
00000000003dd312	movupd	(%rsi,%rdi), %xmm7
00000000003dd317	movupd	(%rsi,%r8), %xmm5
00000000003dd31d	movupd	(%rsi,%rdx), %xmm6
00000000003dd322	movapd	%xmm7, %xmm8
00000000003dd327	subpd	%xmm0, %xmm8
00000000003dd32c	movapd	0x3280cc(%rip), %xmm0
00000000003dd334	mulpd	%xmm0, %xmm8
00000000003dd339	movapd	%xmm5, %xmm9
00000000003dd33e	subpd	%xmm7, %xmm9
00000000003dd343	mulpd	%xmm0, %xmm9
00000000003dd348	addpd	%xmm9, %xmm8
00000000003dd34d	subpd	%xmm5, %xmm6
00000000003dd351	mulpd	%xmm0, %xmm6
00000000003dd355	addpd	%xmm9, %xmm6
00000000003dd35a	movddup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0]
00000000003dd35e	mulpd	%xmm1, %xmm7
00000000003dd362	movddup	%xmm2, %xmm2                    ## xmm2 = xmm2[0,0]
00000000003dd366	mulpd	%xmm2, %xmm8
00000000003dd36b	addpd	%xmm7, %xmm8
00000000003dd370	movddup	%xmm3, %xmm3                    ## xmm3 = xmm3[0,0]
00000000003dd374	mulpd	%xmm3, %xmm6
00000000003dd378	addpd	%xmm8, %xmm6
00000000003dd37d	movddup	%xmm4, %xmm4                    ## xmm4 = xmm4[0,0]
00000000003dd381	mulpd	%xmm4, %xmm5
00000000003dd385	addpd	%xmm6, %xmm5
00000000003dd389	movupd	%xmm5, (%rax)
00000000003dd38d	movupd	0x10(%rsi,%rcx), %xmm5
00000000003dd393	movupd	0x10(%rsi,%rdi), %xmm6
00000000003dd399	movupd	0x10(%rsi,%r8), %xmm7
00000000003dd3a0	movupd	0x10(%rsi,%rdx), %xmm8
00000000003dd3a7	movapd	%xmm6, %xmm9
00000000003dd3ac	subpd	%xmm5, %xmm9
00000000003dd3b1	mulpd	%xmm0, %xmm9
00000000003dd3b6	movapd	%xmm7, %xmm5
00000000003dd3ba	subpd	%xmm6, %xmm5
00000000003dd3be	mulpd	%xmm0, %xmm5
00000000003dd3c2	addpd	%xmm5, %xmm9
00000000003dd3c7	subpd	%xmm7, %xmm8
00000000003dd3cc	mulpd	%xmm0, %xmm8
00000000003dd3d1	addpd	%xmm5, %xmm8
00000000003dd3d6	mulpd	%xmm1, %xmm6
00000000003dd3da	mulpd	%xmm2, %xmm9
00000000003dd3df	addpd	%xmm6, %xmm9
00000000003dd3e4	mulpd	%xmm3, %xmm8
00000000003dd3e9	addpd	%xmm9, %xmm8
00000000003dd3ee	mulpd	%xmm4, %xmm7
00000000003dd3f2	addpd	%xmm8, %xmm7
00000000003dd3f7	movupd	%xmm7, 0x10(%rax)
00000000003dd3fc	movupd	0x20(%rsi,%rcx), %xmm6
00000000003dd402	movupd	0x20(%rsi,%rdi), %xmm7
00000000003dd408	movupd	0x20(%rsi,%r8), %xmm8
00000000003dd40f	movupd	0x20(%rsi,%rdx), %xmm5
00000000003dd415	subpd	%xmm8, %xmm5
00000000003dd41a	mulpd	%xmm8, %xmm4
00000000003dd41f	subpd	%xmm7, %xmm8
00000000003dd424	mulpd	%xmm7, %xmm1
00000000003dd428	subpd	%xmm6, %xmm7
00000000003dd42c	mulpd	%xmm0, %xmm7
00000000003dd430	mulpd	%xmm0, %xmm8
00000000003dd435	addpd	%xmm8, %xmm7
00000000003dd43a	mulpd	%xmm0, %xmm5
00000000003dd43e	addpd	%xmm8, %xmm5
00000000003dd443	mulpd	%xmm2, %xmm7
00000000003dd447	addpd	%xmm1, %xmm7
00000000003dd44b	mulpd	%xmm3, %xmm5
00000000003dd44f	addpd	%xmm7, %xmm5
00000000003dd453	addpd	%xmm5, %xmm4
00000000003dd457	movupd	%xmm4, 0x20(%rax)
00000000003dd45c	popq	%rbp
00000000003dd45d	retq
00000000003dd45e	nop
