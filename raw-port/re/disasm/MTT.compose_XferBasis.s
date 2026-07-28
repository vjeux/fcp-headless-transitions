__ZN26MaterialTextureTransformer23composeTextureTransformERK6CMTimeR29OZChannelMaterialMapTransformP17OZLayeredMaterialbP17OZChannelPositionP14OZChannelScaleP19OZChannelRotation3DidbfR14PCMatrix44TmplIdERN8ProShade21TextureTransformBasisE:
00000000004af780	pushq	%rbp
00000000004af781	movq	%rsp, %rbp
00000000004af784	pushq	%r15
00000000004af786	pushq	%r14
00000000004af788	pushq	%r13
00000000004af78a	pushq	%r12
00000000004af78c	pushq	%rbx
00000000004af78d	subq	$0x148, %rsp                    ## imm = 0x148
00000000004af794	movapd	%xmm0, -0xd0(%rbp)
00000000004af79c	movq	%r9, %r12
00000000004af79f	movq	%r8, -0x30(%rbp)
00000000004af7a3	movl	%ecx, %r15d
00000000004af7a6	movq	%rdx, %rbx
00000000004af7a9	movq	%rsi, %r13
00000000004af7ac	movq	%rdi, %r14
00000000004af7af	leaq	0x80(%rsi), %rdi
00000000004af7b6	movq	0x374d53(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
00000000004af7bd	xorpd	%xmm0, %xmm0
00000000004af7c1	movsd	%xmm0, -0x40(%rbp)
00000000004af7c6	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000004af7cb	testl	%eax, %eax
00000000004af7cd	je	0x4af9a7
00000000004af7d3	testq	%rbx, %rbx
00000000004af7d6	je	0x4afb61
00000000004af7dc	leaq	0xad8(%rbx), %rdi
00000000004af7e3	xorpd	%xmm0, %xmm0
00000000004af7e7	movq	%r14, %rsi
00000000004af7ea	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004af7ef	movapd	%xmm0, -0x80(%rbp)
00000000004af7f4	leaq	0xb70(%rbx), %rdi
00000000004af7fb	xorpd	%xmm0, %xmm0
00000000004af7ff	movq	%r14, %rsi
00000000004af802	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004af807	movapd	%xmm0, -0xb0(%rbp)
00000000004af80f	leaq	0x1368(%rbx), %rdi
00000000004af816	xorpd	%xmm0, %xmm0
00000000004af81a	movq	%r14, %rsi
00000000004af81d	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004af822	movsd	%xmm0, -0x88(%rbp)
00000000004af82a	leaq	0xd98(%rbx), %rdi
00000000004af831	xorpd	%xmm0, %xmm0
00000000004af835	movq	%r14, %rsi
00000000004af838	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004af83d	movapd	%xmm0, -0x50(%rbp)
00000000004af842	leaq	0xe30(%rbx), %rdi
00000000004af849	xorpd	%xmm0, %xmm0
00000000004af84d	movq	%r14, %rsi
00000000004af850	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004af855	movapd	-0x50(%rbp), %xmm4
00000000004af85a	xorpd	%xmm2, %xmm2
00000000004af85e	movapd	%xmm0, %xmm1
00000000004af862	movsd	0x2582e6(%rip), %xmm3
00000000004af86a	ucomisd	%xmm4, %xmm3
00000000004af86e	jbe	0x4af87a
00000000004af870	ucomisd	%xmm2, %xmm4
00000000004af874	movapd	%xmm3, %xmm0
00000000004af878	jae	0x4af8a6
00000000004af87a	movapd	%xmm4, %xmm0
00000000004af87e	cmpltsd	%xmm2, %xmm0
00000000004af883	movapd	%xmm4, %xmm2
00000000004af887	blendvpd	%xmm0, 0x25ed50(%rip), %xmm2
00000000004af890	movsd	0x25ed00(%rip), %xmm0
00000000004af898	cmpltsd	%xmm4, %xmm0
00000000004af89d	blendvpd	%xmm0, %xmm2, %xmm4
00000000004af8a2	movapd	%xmm4, %xmm0
00000000004af8a6	movapd	%xmm0, -0x50(%rbp)
00000000004af8ab	movq	%r12, -0x70(%rbp)
00000000004af8af	ucomisd	%xmm1, %xmm3
00000000004af8b3	jbe	0x4af8bf
00000000004af8b5	xorpd	%xmm0, %xmm0
00000000004af8b9	ucomisd	%xmm0, %xmm1
00000000004af8bd	jae	0x4af8ef
00000000004af8bf	xorpd	%xmm2, %xmm2
00000000004af8c3	movapd	%xmm1, %xmm0
00000000004af8c7	cmpltsd	%xmm2, %xmm0
00000000004af8cc	movapd	%xmm1, %xmm2
00000000004af8d0	blendvpd	%xmm0, 0x25ed07(%rip), %xmm2
00000000004af8d9	movsd	0x25ecb7(%rip), %xmm0
00000000004af8e1	cmpltsd	%xmm1, %xmm0
00000000004af8e6	blendvpd	%xmm0, %xmm2, %xmm1
00000000004af8eb	movapd	%xmm1, %xmm3
00000000004af8ef	movapd	%xmm3, -0xa0(%rbp)
00000000004af8f7	leaq	0x5d0(%rbx), %rax
00000000004af8fe	movq	%rax, -0xb8(%rbp)
00000000004af905	leaq	0x750(%rbx), %rdi
00000000004af90c	movq	0x374bfd(%rip), %r13            ## literal pool symbol address: _kCMTimeZero
00000000004af913	xorpd	%xmm0, %xmm0
00000000004af917	movq	%r13, %rsi
00000000004af91a	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000004af91f	movl	%eax, %r12d
00000000004af922	leaq	0xec8(%rbx), %rdi
00000000004af929	xorpd	%xmm0, %xmm0
00000000004af92d	movq	%r13, %rsi
00000000004af930	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000004af935	testl	%eax, %eax
00000000004af937	setne	%al
00000000004af93a	movl	%eax, -0x34(%rbp)
00000000004af93d	je	0x4afb8f
00000000004af943	leaq	0xf60(%rbx), %rdi
00000000004af94a	movq	0x374bbf(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
00000000004af951	xorpd	%xmm0, %xmm0
00000000004af955	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000004af95a	xorps	%xmm0, %xmm0
00000000004af95d	cvtsi2sd	%eax, %xmm0
00000000004af961	movsd	%xmm0, -0x40(%rbp)
00000000004af966	leaq	0x1080(%rbx), %rdi
00000000004af96d	xorpd	%xmm0, %xmm0
00000000004af971	movq	%r14, %rsi
00000000004af974	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004af979	movapd	%xmm0, -0x60(%rbp)
00000000004af97e	addq	$0x1118, %rbx                   ## imm = 0x1118
00000000004af985	xorpd	%xmm0, %xmm0
00000000004af989	movq	%rbx, %rdi
00000000004af98c	movq	%r14, %rsi
00000000004af98f	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004af994	movapd	-0x60(%rbp), %xmm1
00000000004af999	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
00000000004af99d	movapd	%xmm1, -0x60(%rbp)
00000000004af9a2	jmp	0x4afba1
00000000004af9a7	leaq	0x508(%r13), %rdi
00000000004af9ae	xorpd	%xmm0, %xmm0
00000000004af9b2	movq	%r14, %rsi
00000000004af9b5	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004af9ba	movapd	%xmm0, -0x80(%rbp)
00000000004af9bf	leaq	0x5a0(%r13), %rdi
00000000004af9c6	xorpd	%xmm0, %xmm0
00000000004af9ca	movq	%r14, %rsi
00000000004af9cd	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004af9d2	movapd	%xmm0, -0xb0(%rbp)
00000000004af9da	leaq	0xd98(%r13), %rdi
00000000004af9e1	xorpd	%xmm0, %xmm0
00000000004af9e5	movq	%r14, %rsi
00000000004af9e8	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004af9ed	movsd	%xmm0, -0x88(%rbp)
00000000004af9f5	leaq	0x7c8(%r13), %rdi
00000000004af9fc	xorpd	%xmm0, %xmm0
00000000004afa00	movq	%r14, %rsi
00000000004afa03	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004afa08	movapd	%xmm0, -0x50(%rbp)
00000000004afa0d	leaq	0x860(%r13), %rdi
00000000004afa14	xorpd	%xmm0, %xmm0
00000000004afa18	movq	%r14, %rsi
00000000004afa1b	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004afa20	movapd	-0x50(%rbp), %xmm4
00000000004afa25	xorpd	%xmm2, %xmm2
00000000004afa29	movapd	%xmm0, %xmm1
00000000004afa2d	movsd	0x25811b(%rip), %xmm3
00000000004afa35	ucomisd	%xmm4, %xmm3
00000000004afa39	jbe	0x4afa45
00000000004afa3b	ucomisd	%xmm2, %xmm4
00000000004afa3f	movapd	%xmm3, %xmm0
00000000004afa43	jae	0x4afa71
00000000004afa45	movapd	%xmm4, %xmm0
00000000004afa49	cmpltsd	%xmm2, %xmm0
00000000004afa4e	movapd	%xmm4, %xmm2
00000000004afa52	blendvpd	%xmm0, 0x25eb85(%rip), %xmm2
00000000004afa5b	movsd	0x25eb35(%rip), %xmm0
00000000004afa63	cmpltsd	%xmm4, %xmm0
00000000004afa68	blendvpd	%xmm0, %xmm2, %xmm4
00000000004afa6d	movapd	%xmm4, %xmm0
00000000004afa71	movapd	%xmm0, -0x50(%rbp)
00000000004afa76	movq	%r12, -0x70(%rbp)
00000000004afa7a	ucomisd	%xmm1, %xmm3
00000000004afa7e	jbe	0x4afa8a
00000000004afa80	xorpd	%xmm0, %xmm0
00000000004afa84	ucomisd	%xmm0, %xmm1
00000000004afa88	jae	0x4afaba
00000000004afa8a	xorpd	%xmm2, %xmm2
00000000004afa8e	movapd	%xmm1, %xmm0
00000000004afa92	cmpltsd	%xmm2, %xmm0
00000000004afa97	movapd	%xmm1, %xmm2
00000000004afa9b	blendvpd	%xmm0, 0x25eb3c(%rip), %xmm2
00000000004afaa4	movsd	0x25eaec(%rip), %xmm0
00000000004afaac	cmpltsd	%xmm1, %xmm0
00000000004afab1	blendvpd	%xmm0, %xmm2, %xmm1
00000000004afab6	movapd	%xmm1, %xmm3
00000000004afaba	movapd	%xmm3, -0xa0(%rbp)
00000000004afac2	leaq	0x180(%r13), %rdi
00000000004afac9	movq	0x374a40(%rip), %rbx            ## literal pool symbol address: _kCMTimeZero
00000000004afad0	xorpd	%xmm0, %xmm0
00000000004afad4	movq	%rbx, %rsi
00000000004afad7	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000004afadc	movl	%eax, %r12d
00000000004afadf	leaq	0x8f8(%r13), %rdi
00000000004afae6	xorpd	%xmm0, %xmm0
00000000004afaea	movq	%rbx, %rsi
00000000004afaed	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000004afaf2	testl	%eax, %eax
00000000004afaf4	setne	%al
00000000004afaf7	movl	%eax, -0x34(%rbp)
00000000004afafa	je	0x4afe27
00000000004afb00	leaq	0x990(%r13), %rdi
00000000004afb07	movq	0x374a02(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
00000000004afb0e	xorpd	%xmm0, %xmm0
00000000004afb12	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000004afb17	xorps	%xmm0, %xmm0
00000000004afb1a	cvtsi2sd	%eax, %xmm0
00000000004afb1e	movsd	%xmm0, -0x40(%rbp)
00000000004afb23	leaq	0xab0(%r13), %rdi
00000000004afb2a	xorpd	%xmm0, %xmm0
00000000004afb2e	movq	%r14, %rsi
00000000004afb31	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004afb36	movapd	%xmm0, -0x60(%rbp)
00000000004afb3b	leaq	0xb48(%r13), %rdi
00000000004afb42	xorpd	%xmm0, %xmm0
00000000004afb46	movq	%r14, %rsi
00000000004afb49	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004afb4e	movapd	-0x60(%rbp), %xmm1
00000000004afb53	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
00000000004afb57	movapd	%xmm1, -0x60(%rbp)
00000000004afb5c	jmp	0x4afe39
00000000004afb61	movapd	0x257277(%rip), %xmm2
00000000004afb69	xorpd	%xmm1, %xmm1
00000000004afb6d	movl	$0x0, -0x34(%rbp)
00000000004afb74	xorpd	%xmm0, %xmm0
00000000004afb78	movsd	%xmm0, -0x88(%rbp)
00000000004afb80	xorpd	%xmm0, %xmm0
00000000004afb84	movapd	%xmm0, -0x60(%rbp)
00000000004afb89	movq	-0x30(%rbp), %r13
00000000004afb8d	jmp	0x4afbe6
00000000004afb8f	xorpd	%xmm0, %xmm0
00000000004afb93	movsd	%xmm0, -0x40(%rbp)
00000000004afb98	xorpd	%xmm0, %xmm0
00000000004afb9c	movapd	%xmm0, -0x60(%rbp)
00000000004afba1	movq	-0x30(%rbp), %r13
00000000004afba5	leaq	-0x170(%rbp), %rdi
00000000004afbac	movq	-0xb8(%rbp), %rsi
00000000004afbb3	movq	%r14, %rdx
00000000004afbb6	callq	__ZN29OZChannelMaterialMapTransform15getPreviewScaleERK6CMTime ## OZChannelMaterialMapTransform::getPreviewScale(CMTime const&)
00000000004afbbb	movapd	-0x80(%rbp), %xmm1
00000000004afbc0	unpcklpd	-0xb0(%rbp), %xmm1              ## xmm1 = xmm1[0],mem[0]
00000000004afbc8	movapd	-0x50(%rbp), %xmm2
00000000004afbcd	unpcklpd	-0xa0(%rbp), %xmm2              ## xmm2 = xmm2[0],mem[0]
00000000004afbd5	cmpl	$0x1, %r12d
00000000004afbd9	ja	0x4afbe2
00000000004afbdb	movq	0x30(%rbp), %rax
00000000004afbdf	movl	%r12d, (%rax)
00000000004afbe2	movq	-0x70(%rbp), %r12
00000000004afbe6	movq	0x10(%rbp), %rbx
00000000004afbea	testq	%r13, %r13
00000000004afbed	sete	%al
00000000004afbf0	xorb	$0x1, %r15b
00000000004afbf4	xorpd	%xmm0, %xmm0
00000000004afbf8	movapd	%xmm0, -0x70(%rbp)
00000000004afbfd	orb	%r15b, %al
00000000004afc00	xorps	%xmm0, %xmm0
00000000004afc03	cvtsi2sdl	0x18(%rbp), %xmm0
00000000004afc08	movsd	%xmm0, -0x30(%rbp)
00000000004afc0d	movapd	%xmm1, -0x80(%rbp)
00000000004afc12	movapd	%xmm2, -0x50(%rbp)
00000000004afc17	jne	0x4afc60
00000000004afc19	leaq	0x88(%r13), %rdi
00000000004afc20	movq	%r14, %rsi
00000000004afc23	movsd	-0x30(%rbp), %xmm0
00000000004afc28	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004afc2d	movaps	%xmm0, -0x70(%rbp)
00000000004afc31	addq	$0x120, %r13                    ## imm = 0x120
00000000004afc38	movq	%r13, %rdi
00000000004afc3b	movq	%r14, %rsi
00000000004afc3e	movsd	-0x30(%rbp), %xmm0
00000000004afc43	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004afc48	movapd	-0x50(%rbp), %xmm2
00000000004afc4d	movapd	-0x80(%rbp), %xmm1
00000000004afc52	movapd	-0x70(%rbp), %xmm3
00000000004afc57	unpcklpd	%xmm0, %xmm3                    ## xmm3 = xmm3[0],xmm0[0]
00000000004afc5b	movapd	%xmm3, -0x70(%rbp)
00000000004afc60	testq	%rbx, %rbx
00000000004afc63	sete	%al
00000000004afc66	xorpd	%xmm4, %xmm4
00000000004afc6a	orb	%r15b, %al
00000000004afc6d	jne	0x4afcbc
00000000004afc6f	leaq	0x88(%rbx), %rdi
00000000004afc76	movq	%r14, %rsi
00000000004afc79	movsd	-0x30(%rbp), %xmm0
00000000004afc7e	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004afc83	leaq	0x120(%rbx), %rdi
00000000004afc8a	movq	%r14, %rsi
00000000004afc8d	movsd	-0x30(%rbp), %xmm0
00000000004afc92	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004afc97	addq	$0x1b8, %rbx                    ## imm = 0x1B8
00000000004afc9e	movq	%rbx, %rdi
00000000004afca1	movq	%r14, %rsi
00000000004afca4	movsd	-0x30(%rbp), %xmm0
00000000004afca9	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004afcae	movapd	-0x50(%rbp), %xmm2
00000000004afcb3	movapd	-0x80(%rbp), %xmm1
00000000004afcb8	movapd	%xmm0, %xmm4
00000000004afcbc	testq	%r12, %r12
00000000004afcbf	sete	%al
00000000004afcc2	orb	%al, %r15b
00000000004afcc5	jne	0x4afd31
00000000004afcc7	leaq	0x88(%r12), %rdi
00000000004afccf	movq	%r14, %rsi
00000000004afcd2	movsd	-0x30(%rbp), %xmm0
00000000004afcd7	movsd	%xmm4, -0xb0(%rbp)
00000000004afcdf	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004afce4	movaps	%xmm0, -0xa0(%rbp)
00000000004afceb	addq	$0x120, %r12                    ## imm = 0x120
00000000004afcf2	movq	%r12, %rdi
00000000004afcf5	movq	%r14, %rsi
00000000004afcf8	movsd	-0x30(%rbp), %xmm0
00000000004afcfd	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004afd02	movapd	-0xa0(%rbp), %xmm5
00000000004afd0a	movsd	-0xb0(%rbp), %xmm4
00000000004afd12	movapd	-0x50(%rbp), %xmm2
00000000004afd17	movapd	-0x80(%rbp), %xmm1
00000000004afd1c	unpcklpd	%xmm0, %xmm5                    ## xmm5 = xmm5[0],xmm0[0]
00000000004afd20	movsd	-0x40(%rbp), %xmm3
00000000004afd25	movq	0x28(%rbp), %r14
00000000004afd29	cmpb	$0x0, -0x34(%rbp)
00000000004afd2d	jne	0x4afd48
00000000004afd2f	jmp	0x4afd69
00000000004afd31	movapd	0x2570a7(%rip), %xmm5
00000000004afd39	movsd	-0x40(%rbp), %xmm3
00000000004afd3e	movq	0x28(%rbp), %r14
00000000004afd42	cmpb	$0x0, -0x34(%rbp)
00000000004afd46	je	0x4afd69
00000000004afd48	movapd	-0xd0(%rbp), %xmm0
00000000004afd50	divsd	%xmm3, %xmm0
00000000004afd54	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
00000000004afd58	movapd	-0x60(%rbp), %xmm3
00000000004afd5d	mulpd	%xmm0, %xmm3
00000000004afd61	mulpd	%xmm3, %xmm2
00000000004afd65	mulpd	%xmm0, %xmm1
00000000004afd69	mulpd	%xmm2, %xmm5
00000000004afd6d	movapd	-0x70(%rbp), %xmm0
00000000004afd72	addpd	%xmm1, %xmm0
00000000004afd76	movapd	%xmm0, -0xf0(%rbp)
00000000004afd7e	movsd	-0x88(%rbp), %xmm0
00000000004afd86	addsd	%xmm4, %xmm0
00000000004afd8a	movapd	%xmm5, -0xe0(%rbp)
00000000004afd92	leaq	-0x170(%rbp), %rbx
00000000004afd99	leaq	-0xf0(%rbp), %rsi
00000000004afda0	leaq	-0xe0(%rbp), %rdx
00000000004afda7	movq	%rbx, %rdi
00000000004afdaa	callq	__ZN26MaterialTextureTransformer23composeTextureTransformERK9PCVector2IdEdS3_ ## MaterialTextureTransformer::composeTextureTransform(PCVector2<double> const&, double, PCVector2<double> const&)
00000000004afdaf	cmpq	%r14, %rbx
00000000004afdb2	je	0x4afe15
00000000004afdb4	movaps	-0x170(%rbp), %xmm0
00000000004afdbb	movups	%xmm0, (%r14)
00000000004afdbf	movaps	-0x160(%rbp), %xmm0
00000000004afdc6	movups	%xmm0, 0x10(%r14)
00000000004afdcb	movaps	-0x150(%rbp), %xmm0
00000000004afdd2	movups	%xmm0, 0x20(%r14)
00000000004afdd7	movaps	-0x140(%rbp), %xmm0
00000000004afdde	movups	%xmm0, 0x30(%r14)
00000000004afde3	movaps	-0x130(%rbp), %xmm0
00000000004afdea	movups	%xmm0, 0x40(%r14)
00000000004afdef	movaps	-0x120(%rbp), %xmm0
00000000004afdf6	movups	%xmm0, 0x50(%r14)
00000000004afdfb	movaps	-0x110(%rbp), %xmm0
00000000004afe02	movups	%xmm0, 0x60(%r14)
00000000004afe07	movapd	-0x100(%rbp), %xmm0
00000000004afe0f	movupd	%xmm0, 0x70(%r14)
00000000004afe15	addq	$0x148, %rsp                    ## imm = 0x148
00000000004afe1c	popq	%rbx
00000000004afe1d	popq	%r12
00000000004afe1f	popq	%r13
00000000004afe21	popq	%r14
00000000004afe23	popq	%r15
00000000004afe25	popq	%rbp
00000000004afe26	retq
00000000004afe27	xorpd	%xmm0, %xmm0
00000000004afe2b	movsd	%xmm0, -0x40(%rbp)
00000000004afe30	xorpd	%xmm0, %xmm0
00000000004afe34	movapd	%xmm0, -0x60(%rbp)
00000000004afe39	leaq	-0x170(%rbp), %rdi
00000000004afe40	movq	%r13, %rsi
00000000004afe43	movq	%r14, %rdx
00000000004afe46	callq	__ZN29OZChannelMaterialMapTransform15getPreviewScaleERK6CMTime ## OZChannelMaterialMapTransform::getPreviewScale(CMTime const&)
00000000004afe4b	movapd	-0x80(%rbp), %xmm1
00000000004afe50	unpcklpd	-0xb0(%rbp), %xmm1              ## xmm1 = xmm1[0],mem[0]
00000000004afe58	movapd	-0x50(%rbp), %xmm2
00000000004afe5d	unpcklpd	-0xa0(%rbp), %xmm2              ## xmm2 = xmm2[0],mem[0]
00000000004afe65	movq	-0x30(%rbp), %r13
00000000004afe69	cmpl	$0x1, %r12d
00000000004afe6d	jbe	0x4afbdb
00000000004afe73	jmp	0x4afbe2
00000000004afe78	nopl	(%rax,%rax)