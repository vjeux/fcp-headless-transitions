__ZN17OZWriteOnBehavior11getPositionERK6CMTimeS2_:
00000000004768f0	pushq	%rbp
00000000004768f1	movq	%rsp, %rbp
00000000004768f4	pushq	%r15
00000000004768f6	pushq	%r14
00000000004768f8	pushq	%r13
00000000004768fa	pushq	%r12
00000000004768fc	pushq	%rbx
00000000004768fd	subq	$0xe8, %rsp
0000000000476904	movq	%rdx, %r12
0000000000476907	movq	%rsi, %r13
000000000047690a	movq	%rdi, %rbx
000000000047690d	movq	0x3adbfc(%rip), %r15            ## literal pool symbol address: _kCMTimeZero
0000000000476914	movq	0x10(%r15), %rax
0000000000476918	movq	%rax, -0xa0(%rbp)
000000000047691f	movupd	(%r15), %xmm0
0000000000476924	movapd	%xmm0, -0xb0(%rbp)
000000000047692c	movq	$0x0, -0x30(%rbp)
0000000000476934	addq	$0x540, %rdi                    ## imm = 0x540
000000000047693b	xorpd	%xmm0, %xmm0
000000000047693f	movq	%r15, %rsi
0000000000476942	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
0000000000476947	movl	%eax, %r14d
000000000047694a	movq	(%rbx), %rax
000000000047694d	leaq	-0xe0(%rbp), %rdi
0000000000476954	movq	%rbx, %rsi
0000000000476957	callq	*0x268(%rax)
000000000047695d	cmpl	$0x7, %r14d
0000000000476961	jne	0x47697e
0000000000476963	addq	$0x640, %rbx                    ## imm = 0x640
000000000047696a	xorpd	%xmm0, %xmm0
000000000047696e	movq	%rbx, %rdi
0000000000476971	movq	%r13, %rsi
0000000000476974	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000476979	jmp	0x476ad6
000000000047697e	movq	(%rbx), %rax
0000000000476981	movq	%rbx, %rdi
0000000000476984	callq	*0x150(%rax)
000000000047698a	testq	%rax, %rax
000000000047698d	xorpd	%xmm0, %xmm0
0000000000476991	je	0x476ad6
0000000000476997	movq	0x10(%r15), %rax
000000000047699b	movq	%rax, -0x80(%rbp)
000000000047699f	movups	(%r15), %xmm0
00000000004769a3	movaps	%xmm0, -0x90(%rbp)
00000000004769aa	movq	-0xb8(%rbp), %rax
00000000004769b1	movq	%rax, -0x40(%rbp)
00000000004769b5	movups	-0xc8(%rbp), %xmm0
00000000004769bc	movaps	%xmm0, -0x50(%rbp)
00000000004769c0	movq	(%rbx), %rax
00000000004769c3	movq	%rbx, %rdi
00000000004769c6	callq	*0x150(%rax)
00000000004769cc	leaq	0x90(%rax), %rsi
00000000004769d3	leaq	-0x70(%rbp), %rdi
00000000004769d7	callq	__ZNK15OZSceneSettings16getFrameDurationEv ## OZSceneSettings::getFrameDuration() const
00000000004769dc	movq	-0x60(%rbp), %rax
00000000004769e0	movq	%rax, 0x28(%rsp)
00000000004769e5	movups	-0x70(%rbp), %xmm0
00000000004769e9	movups	%xmm0, 0x18(%rsp)
00000000004769ee	movq	-0x40(%rbp), %rax
00000000004769f2	movq	%rax, 0x10(%rsp)
00000000004769f7	movaps	-0x50(%rbp), %xmm0
00000000004769fb	movups	%xmm0, (%rsp)
00000000004769ff	leaq	-0x90(%rbp), %rdi
0000000000476a06	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000476a0b	movups	(%r12), %xmm0
0000000000476a10	movaps	%xmm0, -0x70(%rbp)
0000000000476a14	movq	0x10(%r12), %rax
0000000000476a19	movq	%rax, -0x60(%rbp)
0000000000476a1d	movq	0x10(%r15), %rax
0000000000476a21	movq	%rax, -0x40(%rbp)
0000000000476a25	movups	(%r15), %xmm0
0000000000476a29	movaps	%xmm0, -0x50(%rbp)
0000000000476a2d	movq	-0x40(%rbp), %rax
0000000000476a31	movq	%rax, 0x28(%rsp)
0000000000476a36	movaps	-0x50(%rbp), %xmm0
0000000000476a3a	movups	%xmm0, 0x18(%rsp)
0000000000476a3f	movq	-0x80(%rbp), %rax
0000000000476a43	movq	%rax, 0x10(%rsp)
0000000000476a48	movapd	-0x90(%rbp), %xmm0
0000000000476a50	movupd	%xmm0, (%rsp)
0000000000476a55	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
0000000000476a5a	testl	%eax, %eax
0000000000476a5c	jle	0x476aaa
0000000000476a5e	cmpl	$0x9, %r14d
0000000000476a62	ja	0x476ab8
0000000000476a64	movl	%r14d, %eax
0000000000476a67	leaq	0x4fa(%rip), %rcx
0000000000476a6e	movslq	(%rcx,%rax,4), %rax
0000000000476a72	addq	%rcx, %rax
0000000000476a75	jmpq	*%rax
0000000000476a77	leaq	-0x50(%rbp), %rdi
0000000000476a7b	leaq	-0x70(%rbp), %rsi
0000000000476a7f	leaq	-0x90(%rbp), %rdx
0000000000476a86	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
0000000000476a8b	movq	-0x40(%rbp), %rax
0000000000476a8f	movq	%rax, 0x10(%rsp)
0000000000476a94	movupd	-0x50(%rbp), %xmm0
0000000000476a99	movupd	%xmm0, (%rsp)
0000000000476a9e	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
0000000000476aa3	movsd	%xmm0, -0x30(%rbp)
0000000000476aa8	jmp	0x476ab8
0000000000476aaa	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
0000000000476ab4	movq	%rax, -0x30(%rbp)
0000000000476ab8	movsd	-0x30(%rbp), %xmm0
0000000000476abd	movsd	0x28e91b(%rip), %xmm2
0000000000476ac5	minsd	%xmm0, %xmm2
0000000000476ac9	xorpd	%xmm1, %xmm1
0000000000476acd	cmpltsd	%xmm1, %xmm0
0000000000476ad2	andnpd	%xmm2, %xmm0
0000000000476ad6	addq	$0xe8, %rsp
0000000000476add	popq	%rbx
0000000000476ade	popq	%r12
0000000000476ae0	popq	%r13
0000000000476ae2	popq	%r14
0000000000476ae4	popq	%r15
0000000000476ae6	popq	%rbp
0000000000476ae7	retq
0000000000476ae8	addq	$0x770, %rbx                    ## imm = 0x770
0000000000476aef	movq	0x3ada1a(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
0000000000476af6	xorpd	%xmm0, %xmm0
0000000000476afa	movq	%rbx, %rdi
0000000000476afd	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
0000000000476b02	leaq	-0x50(%rbp), %rdi
0000000000476b06	leaq	-0x70(%rbp), %rsi
0000000000476b0a	leaq	-0x90(%rbp), %rdx
0000000000476b11	testl	%eax, %eax
0000000000476b13	je	0x476e0f
0000000000476b19	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
0000000000476b1e	movq	-0x40(%rbp), %rax
0000000000476b22	movq	%rax, 0x10(%rsp)
0000000000476b27	movupd	-0x50(%rbp), %xmm0
0000000000476b2c	movupd	%xmm0, (%rsp)
0000000000476b31	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
0000000000476b36	addsd	0x28e8a2(%rip), %xmm0
0000000000476b3e	mulsd	0x29227a(%rip), %xmm0
0000000000476b46	callq	0x6dfd92                        ## symbol stub for: _cos
0000000000476b4b	addsd	0x28e88d(%rip), %xmm0
0000000000476b53	mulsd	0x29034d(%rip), %xmm0
0000000000476b5b	movsd	%xmm0, -0x30(%rbp)
0000000000476b60	jmp	0x476ab8
0000000000476b65	movq	-0x80(%rbp), %rax
0000000000476b69	movq	%rax, 0x10(%rsp)
0000000000476b6e	movapd	-0x90(%rbp), %xmm0
0000000000476b76	movupd	%xmm0, (%rsp)
0000000000476b7b	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
0000000000476b80	mulsd	%xmm0, %xmm0
0000000000476b84	movsd	0x28e854(%rip), %xmm1
0000000000476b8c	divsd	%xmm0, %xmm1
0000000000476b90	movsd	%xmm1, -0x98(%rbp)
0000000000476b98	movq	-0x60(%rbp), %rax
0000000000476b9c	movq	%rax, 0x28(%rsp)
0000000000476ba1	movaps	-0x70(%rbp), %xmm0
0000000000476ba5	movups	%xmm0, 0x18(%rsp)
0000000000476baa	movq	-0x80(%rbp), %rax
0000000000476bae	movq	%rax, 0x10(%rsp)
0000000000476bb3	movaps	-0x90(%rbp), %xmm0
0000000000476bba	movups	%xmm0, (%rsp)
0000000000476bbe	leaq	-0x50(%rbp), %rdi
0000000000476bc2	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000476bc7	movq	-0x40(%rbp), %rax
0000000000476bcb	movq	%rax, 0x10(%rsp)
0000000000476bd0	movupd	-0x50(%rbp), %xmm0
0000000000476bd5	movupd	%xmm0, (%rsp)
0000000000476bda	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
0000000000476bdf	mulsd	%xmm0, %xmm0
0000000000476be3	mulsd	-0x98(%rbp), %xmm0
0000000000476beb	movsd	0x28e7ed(%rip), %xmm1
0000000000476bf3	subsd	%xmm0, %xmm1
0000000000476bf7	movsd	%xmm1, -0x30(%rbp)
0000000000476bfc	jmp	0x476ab8
0000000000476c01	addq	$0x770, %rbx                    ## imm = 0x770
0000000000476c08	movq	0x3ad901(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
0000000000476c0f	xorpd	%xmm0, %xmm0
0000000000476c13	movq	%rbx, %rdi
0000000000476c16	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
0000000000476c1b	leaq	-0x50(%rbp), %rdi
0000000000476c1f	leaq	-0x70(%rbp), %rsi
0000000000476c23	leaq	-0x90(%rbp), %rdx
0000000000476c2a	testl	%eax, %eax
0000000000476c2c	je	0x476e4e
0000000000476c32	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
0000000000476c37	movq	-0x40(%rbp), %rax
0000000000476c3b	movq	%rax, 0x10(%rsp)
0000000000476c40	movupd	-0x50(%rbp), %xmm0
0000000000476c45	movupd	%xmm0, (%rsp)
0000000000476c4a	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
0000000000476c4f	addsd	0x290291(%rip), %xmm0
0000000000476c57	mulsd	0x292181(%rip), %xmm0
0000000000476c5f	callq	0x6dfd92                        ## symbol stub for: _cos
0000000000476c64	addsd	0x28e774(%rip), %xmm0
0000000000476c6c	movsd	%xmm0, -0x30(%rbp)
0000000000476c71	jmp	0x476ab8
0000000000476c76	addq	$0x770, %rbx                    ## imm = 0x770
0000000000476c7d	movq	0x3ad88c(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
0000000000476c84	xorpd	%xmm0, %xmm0
0000000000476c88	movq	%rbx, %rdi
0000000000476c8b	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
0000000000476c90	leaq	-0x50(%rbp), %rdi
0000000000476c94	leaq	-0x70(%rbp), %rsi
0000000000476c98	leaq	-0x90(%rbp), %rdx
0000000000476c9f	testl	%eax, %eax
0000000000476ca1	je	0x476e89
0000000000476ca7	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
0000000000476cac	movq	-0x40(%rbp), %rax
0000000000476cb0	movq	%rax, 0x10(%rsp)
0000000000476cb5	movupd	-0x50(%rbp), %xmm0
0000000000476cba	movupd	%xmm0, (%rsp)
0000000000476cbf	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
0000000000476cc4	mulsd	0x292114(%rip), %xmm0
0000000000476ccc	callq	0x6e00da                        ## symbol stub for: _sin
0000000000476cd1	movsd	%xmm0, -0x30(%rbp)
0000000000476cd6	jmp	0x476ab8
0000000000476cdb	leaq	-0xb0(%rbp), %rdi
0000000000476ce2	leaq	-0x90(%rbp), %rsi
0000000000476ce9	movsd	0x2901b7(%rip), %xmm0
0000000000476cf1	callq	0x6dfc72                        ## symbol stub for: __ZmlRK6CMTimed
0000000000476cf6	movq	-0xa0(%rbp), %rax
0000000000476cfd	movq	%rax, 0x28(%rsp)
0000000000476d02	movaps	-0xb0(%rbp), %xmm0
0000000000476d09	movups	%xmm0, 0x18(%rsp)
0000000000476d0e	movq	-0x60(%rbp), %rax
0000000000476d12	movq	%rax, 0x10(%rsp)
0000000000476d17	movaps	-0x70(%rbp), %xmm0
0000000000476d1b	movups	%xmm0, (%rsp)
0000000000476d1f	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
0000000000476d24	leaq	-0x50(%rbp), %rdi
0000000000476d28	leaq	-0xb0(%rbp), %rsi
0000000000476d2f	leaq	-0x70(%rbp), %rdx
0000000000476d33	testl	%eax, %eax
0000000000476d35	jle	0x476ece
0000000000476d3b	callq	0x6dfc6c                        ## symbol stub for: __ZmlRK6CMTimeS1_
0000000000476d40	movq	-0x40(%rbp), %rax
0000000000476d44	movq	%rax, 0x10(%rsp)
0000000000476d49	movupd	-0x50(%rbp), %xmm0
0000000000476d4e	movupd	%xmm0, (%rsp)
0000000000476d53	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
0000000000476d58	movsd	0x2909c8(%rip), %xmm1
0000000000476d60	divsd	%xmm0, %xmm1
0000000000476d64	addsd	0x29017c(%rip), %xmm1
0000000000476d6c	movsd	%xmm1, -0x30(%rbp)
0000000000476d71	jmp	0x476ab8
0000000000476d76	movq	-0x80(%rbp), %rax
0000000000476d7a	movq	%rax, 0x10(%rsp)
0000000000476d7f	movapd	-0x90(%rbp), %xmm0
0000000000476d87	movupd	%xmm0, (%rsp)
0000000000476d8c	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
0000000000476d91	mulsd	%xmm0, %xmm0
0000000000476d95	movsd	0x28e643(%rip), %xmm1
0000000000476d9d	divsd	%xmm0, %xmm1
0000000000476da1	movsd	%xmm1, -0x98(%rbp)
0000000000476da9	movq	-0x60(%rbp), %rax
0000000000476dad	movq	%rax, 0x10(%rsp)
0000000000476db2	movapd	-0x70(%rbp), %xmm0
0000000000476db7	movupd	%xmm0, (%rsp)
0000000000476dbc	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
0000000000476dc1	mulsd	%xmm0, %xmm0
0000000000476dc5	mulsd	-0x98(%rbp), %xmm0
0000000000476dcd	movsd	%xmm0, -0x30(%rbp)
0000000000476dd2	jmp	0x476ab8
0000000000476dd7	movq	(%rbx), %rax
0000000000476dda	movq	%rbx, %rdi
0000000000476ddd	callq	*0x140(%rax)
0000000000476de3	testq	%rax, %rax
0000000000476de6	je	0x476f01
0000000000476dec	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
0000000000476df3	leaq	__ZTI11OZRotoshape(%rip), %rdx  ## typeinfo for OZRotoshape
0000000000476dfa	movl	$0xc8, %ecx
0000000000476dff	movq	%rax, %rdi
0000000000476e02	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000476e07	movq	%rax, %rbx
0000000000476e0a	jmp	0x476f03
0000000000476e0f	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
0000000000476e14	movq	-0x40(%rbp), %rax
0000000000476e18	movq	%rax, 0x10(%rsp)
0000000000476e1d	movupd	-0x50(%rbp), %xmm0
0000000000476e22	movupd	%xmm0, (%rsp)
0000000000476e27	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
0000000000476e2c	movsd	%xmm0, -0x30(%rbp)
0000000000476e31	movsd	0x29006f(%rip), %xmm1
0000000000476e39	movsd	0x28e59f(%rip), %xmm4
0000000000476e41	leaq	-0x30(%rbp), %rdi
0000000000476e45	xorps	%xmm3, %xmm3
0000000000476e48	movapd	%xmm1, %xmm2
0000000000476e4c	jmp	0x476ec2
0000000000476e4e	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
0000000000476e53	movq	-0x40(%rbp), %rax
0000000000476e57	movq	%rax, 0x10(%rsp)
0000000000476e5c	movupd	-0x50(%rbp), %xmm0
0000000000476e61	movupd	%xmm0, (%rsp)
0000000000476e66	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
0000000000476e6b	movsd	%xmm0, -0x30(%rbp)
0000000000476e70	movsd	0x28e568(%rip), %xmm2
0000000000476e78	leaq	-0x30(%rbp), %rdi
0000000000476e7c	xorpd	%xmm1, %xmm1
0000000000476e80	xorps	%xmm3, %xmm3
0000000000476e83	movapd	%xmm2, %xmm4
0000000000476e87	jmp	0x476ec2
0000000000476e89	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
0000000000476e8e	movq	-0x40(%rbp), %rax
0000000000476e92	movq	%rax, 0x10(%rsp)
0000000000476e97	movupd	-0x50(%rbp), %xmm0
0000000000476e9c	movupd	%xmm0, (%rsp)
0000000000476ea1	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
0000000000476ea6	movsd	%xmm0, -0x30(%rbp)
0000000000476eab	movsd	0x28e52d(%rip), %xmm1
0000000000476eb3	leaq	-0x30(%rbp), %rdi
0000000000476eb7	xorpd	%xmm2, %xmm2
0000000000476ebb	xorps	%xmm3, %xmm3
0000000000476ebe	movapd	%xmm1, %xmm4
0000000000476ec2	xorl	%esi, %esi
0000000000476ec4	callq	0x6dea5a                        ## symbol stub for: __ZN6PCMath9easeInOutEdddddPdS0_
0000000000476ec9	jmp	0x476ab8
0000000000476ece	callq	0x6dfc6c                        ## symbol stub for: __ZmlRK6CMTimeS1_
0000000000476ed3	movq	-0x40(%rbp), %rax
0000000000476ed7	movq	%rax, 0x10(%rsp)
0000000000476edc	movupd	-0x50(%rbp), %xmm0
0000000000476ee1	movupd	%xmm0, (%rsp)
0000000000476ee6	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
0000000000476eeb	movsd	0x28e4ed(%rip), %xmm1
0000000000476ef3	divsd	%xmm0, %xmm1
0000000000476ef7	movsd	%xmm1, -0x30(%rbp)
0000000000476efc	jmp	0x476ab8
0000000000476f01	xorl	%ebx, %ebx
0000000000476f03	leaq	-0x50(%rbp), %rdi
0000000000476f07	leaq	-0x70(%rbp), %rsi
0000000000476f0b	leaq	-0x90(%rbp), %rdx
0000000000476f12	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
0000000000476f17	movq	-0x40(%rbp), %rax
0000000000476f1b	movq	%rax, 0x10(%rsp)
0000000000476f20	movupd	-0x50(%rbp), %xmm0
0000000000476f25	movupd	%xmm0, (%rsp)
0000000000476f2a	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
0000000000476f2f	movsd	%xmm0, -0x30(%rbp)
0000000000476f34	addq	$0x7240, %rbx                   ## imm = 0x7240
0000000000476f3b	leaq	-0x50(%rbp), %r14
0000000000476f3f	movq	%r14, %rdi
0000000000476f42	movl	$0x40000, %esi                  ## imm = 0x40000
0000000000476f47	callq	0x6dd254                        ## symbol stub for: __Z26OZFigTimeForChannelSecondsdi
0000000000476f4c	xorpd	%xmm0, %xmm0
0000000000476f50	movq	%rbx, %rdi
0000000000476f53	movq	%r14, %rsi
0000000000476f56	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000476f5b	movsd	%xmm0, -0x30(%rbp)
0000000000476f60	jmp	0x476ab8
0000000000476f65	nopl	(%rax)
0000000000476f68	psubq	%mm7, %mm7
0000000000476f6b	lcalll	*0xefffffc(%rcx)
0000000000476f71	std
0000000000476f72	.byte 0xff #bad opcode
0000000000476f73	incl	0x73fffffb(%rax)
0000000000476f79	std
0000000000476f7a	.byte 0xff #bad opcode
0000000000476f7b	decl	(%rsi)
0000000000476f7d	.byte 0xfe #bad opcode
0000000000476f7e	.byte 0xff #bad opcode
0000000000476f7f	.byte 0xff #bad opcode
0000000000476f80	std
0000000000476f81	sti
0000000000476f82	.byte 0xff #bad opcode
0000000000476f83	callq	*-0x5(%rax)
0000000000476f86	.byte 0xff #bad opcode
0000000000476f87	decl	(%rdi)
0000000000476f89	sti
0000000000476f8a	.byte 0xff #bad opcode
0000000000476f8b	ljmpl	*-0x2(%rdi)
0000000000476f8e	.byte 0xff #bad opcode
0000000000476f8f	callq	*0x48(%rbp)
0000000000476f92	movl	%esp, %ebp
0000000000476f94	pushq	%r15
0000000000476f96	pushq	%r14
0000000000476f98	pushq	%r13
0000000000476f9a	pushq	%r12
0000000000476f9c	pushq	%rbx
0000000000476f9d	subq	$0x88, %rsp
0000000000476fa4	movq	0x98(%rdx), %rax
0000000000476fab	movq	%rax, -0x48(%rbp)
0000000000476faf	movq	0x50(%rdx), %r13
0000000000476fb3	movq	0x88(%rdx), %rax
0000000000476fba	movq	%rax, -0x50(%rbp)
0000000000476fbe	movups	0x78(%rdx), %xmm0
0000000000476fc2	movaps	%xmm0, -0x60(%rbp)
0000000000476fc6	movq	0x70(%rdx), %rax
0000000000476fca	movq	%rax, -0x30(%rbp)
0000000000476fce	movups	0x60(%rdx), %xmm0
0000000000476fd2	movaps	%xmm0, -0x40(%rbp)
0000000000476fd6	cmpl	$0x0, 0x90(%rdx)
0000000000476fdd	je	0x47705a
0000000000476fdf	movq	%rdx, %rbx
0000000000476fe2	movq	%rsi, %r15
0000000000476fe5	movq	%rdi, %r12
0000000000476fe8	xorl	%r14d, %r14d
0000000000476feb	nopl	(%rax,%rax)
0000000000476ff0	movsd	(%r13,%r14,8), %xmm1
0000000000476ff7	movq	%r12, %rdi
0000000000476ffa	movq	%r15, %rsi
0000000000476ffd	leaq	-0x40(%rbp), %rdx
0000000000477001	callq	__ZN17OZWriteOnBehavior16solveWriteOnNodeEP13OZChannelBaseRK6CMTimedd ## OZWriteOnBehavior::solveWriteOnNode(OZChannelBase*, CMTime const&, double, double)
0000000000477006	movq	-0x48(%rbp), %rax
000000000047700a	movsd	%xmm0, (%rax,%r14,8)
0000000000477010	movq	-0x50(%rbp), %rax
0000000000477014	movq	%rax, 0x28(%rsp)
0000000000477019	movaps	-0x60(%rbp), %xmm0
000000000047701d	movups	%xmm0, 0x18(%rsp)
0000000000477022	movq	-0x30(%rbp), %rax
0000000000477026	movq	%rax, 0x10(%rsp)
000000000047702b	movaps	-0x40(%rbp), %xmm0
000000000047702f	movups	%xmm0, (%rsp)
0000000000477033	leaq	-0x78(%rbp), %rdi
0000000000477037	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
000000000047703c	movq	-0x68(%rbp), %rax
0000000000477040	movq	%rax, -0x30(%rbp)
0000000000477044	movups	-0x78(%rbp), %xmm0
0000000000477048	movaps	%xmm0, -0x40(%rbp)
000000000047704c	incq	%r14
000000000047704f	movl	0x90(%rbx), %eax
0000000000477055	cmpq	%rax, %r14
0000000000477058	jb	0x476ff0
000000000047705a	addq	$0x88, %rsp
0000000000477061	popq	%rbx
0000000000477062	popq	%r12
0000000000477064	popq	%r13
0000000000477066	popq	%r14
0000000000477068	popq	%r15
000000000047706a	popq	%rbp
000000000047706b	retq
000000000047706c	nopl	(%rax)
