__ZN30OZ3DEnginePhysicsFieldBehavior17updateHiddenFlagsEPNSt3__14listIP10OZBehaviorNS0_9allocatorIS3_EEEE:
00000000004f0e30	pushq	%rbp
00000000004f0e31	movq	%rsp, %rbp
00000000004f0e34	pushq	%r15
00000000004f0e36	pushq	%r14
00000000004f0e38	pushq	%r13
00000000004f0e3a	pushq	%r12
00000000004f0e3c	pushq	%rbx
00000000004f0e3d	subq	$0x28, %rsp
00000000004f0e41	movq	%rsi, %rbx
00000000004f0e44	movq	%rdi, %r14
00000000004f0e47	movq	0x3336c2(%rip), %rax            ## literal pool symbol address: _kCMTimeZero
00000000004f0e4e	movq	0x10(%rax), %rcx
00000000004f0e52	movq	%rcx, -0x40(%rbp)
00000000004f0e56	movups	(%rax), %xmm0
00000000004f0e59	movaps	%xmm0, -0x50(%rbp)
00000000004f0e5d	addq	$0x210, %rdi                    ## imm = 0x210
00000000004f0e64	leaq	-0x50(%rbp), %r15
00000000004f0e68	xorps	%xmm0, %xmm0
00000000004f0e6b	movq	%r15, %rsi
00000000004f0e6e	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000004f0e73	movl	%eax, -0x2c(%rbp)
00000000004f0e76	addq	$0x440, %r14                    ## imm = 0x440
00000000004f0e7d	xorps	%xmm0, %xmm0
00000000004f0e80	movq	%r14, %rdi
00000000004f0e83	movq	%r15, %rsi
00000000004f0e86	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000004f0e8b	movl	%eax, -0x30(%rbp)
00000000004f0e8e	movq	0x8(%rbx), %r12
00000000004f0e92	cmpq	%rbx, %r12
00000000004f0e95	je	0x4f1195
00000000004f0e9b	leaq	-0x50(%rbp), %r14
00000000004f0e9f	jmp	0x4f0eba
00000000004f0ea1	nopw	%cs:(%rax,%rax)
00000000004f0eb0	movq	0x8(%r12), %r12
00000000004f0eb5	cmpq	%rbx, %r12
00000000004f0eb8	je	0x4f0f2f
00000000004f0eba	movq	0x10(%r12), %rdi
00000000004f0ebf	testq	%rdi, %rdi
00000000004f0ec2	je	0x4f0eb0
00000000004f0ec4	leaq	__ZTI10OZBehavior(%rip), %rsi   ## typeinfo for OZBehavior
00000000004f0ecb	leaq	__ZTI30OZ3DEnginePhysicsFieldBehavior(%rip), %rdx ## typeinfo for OZ3DEnginePhysicsFieldBehavior
00000000004f0ed2	xorl	%ecx, %ecx
00000000004f0ed4	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000004f0ed9	testq	%rax, %rax
00000000004f0edc	je	0x4f0eb0
00000000004f0ede	movq	%rax, %r15
00000000004f0ee1	leaq	0x210(%rax), %rdi
00000000004f0ee8	xorps	%xmm0, %xmm0
00000000004f0eeb	movq	%r14, %rsi
00000000004f0eee	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000004f0ef3	cmpl	-0x2c(%rbp), %eax
00000000004f0ef6	jne	0x4f0f1f
00000000004f0ef8	cmpl	$0x0, -0x30(%rbp)
00000000004f0efc	setne	%r13b
00000000004f0f00	addq	$0x440, %r15                    ## imm = 0x440
00000000004f0f07	xorps	%xmm0, %xmm0
00000000004f0f0a	movq	%r15, %rdi
00000000004f0f0d	movq	%r14, %rsi
00000000004f0f10	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000004f0f15	testl	%eax, %eax
00000000004f0f17	setne	%al
00000000004f0f1a	xorb	%r13b, %al
00000000004f0f1d	je	0x4f0eb0
00000000004f0f1f	xorl	%eax, %eax
00000000004f0f21	movq	0x8(%rbx), %r13
00000000004f0f25	cmpq	%rbx, %r13
00000000004f0f28	jne	0x4f0f3e
00000000004f0f2a	jmp	0x4f1195
00000000004f0f2f	movb	$0x1, %al
00000000004f0f31	movq	0x8(%rbx), %r13
00000000004f0f35	cmpq	%rbx, %r13
00000000004f0f38	je	0x4f1195
00000000004f0f3e	testb	%al, %al
00000000004f0f40	je	0x4f1057
00000000004f0f46	movl	-0x2c(%rbp), %eax
00000000004f0f49	andl	$-0x2, %eax
00000000004f0f4c	leaq	__ZTI10OZBehavior(%rip), %r15   ## typeinfo for OZBehavior
00000000004f0f53	cmpl	$0x4, %eax
00000000004f0f56	jne	0x4f10cb
00000000004f0f5c	leaq	__ZTI30OZ3DEnginePhysicsFieldBehavior(%rip), %r14 ## typeinfo for OZ3DEnginePhysicsFieldBehavior
00000000004f0f63	jmp	0x4f0faf
00000000004f0f65	nopw	%cs:(%rax,%rax)
00000000004f0f70	movl	$0x400000, %esi                 ## imm = 0x400000
00000000004f0f75	movl	$0x1, %edx
00000000004f0f7a	callq	0x6dd92c                        ## symbol stub for: __ZN13OZChannelBase9resetFlagEyb
00000000004f0f7f	addq	$0x4d8, %r12                    ## imm = 0x4D8
00000000004f0f86	cmpl	$0x0, -0x30(%rbp)
00000000004f0f8a	je	0x4f1033
00000000004f0f90	movl	$0x400000, %esi                 ## imm = 0x400000
00000000004f0f95	movq	%r12, %rdi
00000000004f0f98	movl	$0x1, %edx
00000000004f0f9d	callq	0x6dd914                        ## symbol stub for: __ZN13OZChannelBase7setFlagEyb
00000000004f0fa2	movq	0x8(%r13), %r13
00000000004f0fa6	cmpq	%rbx, %r13
00000000004f0fa9	je	0x4f1195
00000000004f0faf	movq	0x10(%r13), %rdi
00000000004f0fb3	testq	%rdi, %rdi
00000000004f0fb6	je	0x4f0fd0
00000000004f0fb8	movq	%r15, %rsi
00000000004f0fbb	movq	%r14, %rdx
00000000004f0fbe	xorl	%ecx, %ecx
00000000004f0fc0	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000004f0fc5	movq	%rax, %r12
00000000004f0fc8	jmp	0x4f0fd3
00000000004f0fca	nopw	(%rax,%rax)
00000000004f0fd0	xorl	%r12d, %r12d
00000000004f0fd3	leaq	0x978(%r12), %rdi
00000000004f0fdb	movl	$0x400000, %esi                 ## imm = 0x400000
00000000004f0fe0	movl	$0x1, %edx
00000000004f0fe5	callq	0x6dd92c                        ## symbol stub for: __ZN13OZChannelBase9resetFlagEyb
00000000004f0fea	leaq	0xa10(%r12), %rdi
00000000004f0ff2	movl	$0x400000, %esi                 ## imm = 0x400000
00000000004f0ff7	movl	$0x1, %edx
00000000004f0ffc	callq	0x6dd92c                        ## symbol stub for: __ZN13OZChannelBase9resetFlagEyb
00000000004f1001	leaq	0x728(%r12), %rdi
00000000004f1009	cmpl	$0x4, -0x2c(%rbp)
00000000004f100d	jne	0x4f0f70
00000000004f1013	movl	$0x400000, %esi                 ## imm = 0x400000
00000000004f1018	movl	$0x1, %edx
00000000004f101d	callq	0x6dd914                        ## symbol stub for: __ZN13OZChannelBase7setFlagEyb
00000000004f1022	addq	$0x4d8, %r12                    ## imm = 0x4D8
00000000004f1029	cmpl	$0x0, -0x30(%rbp)
00000000004f102d	jne	0x4f0f90
00000000004f1033	movl	$0x400000, %esi                 ## imm = 0x400000
00000000004f1038	movq	%r12, %rdi
00000000004f103b	movl	$0x1, %edx
00000000004f1040	callq	0x6dd92c                        ## symbol stub for: __ZN13OZChannelBase9resetFlagEyb
00000000004f1045	movq	0x8(%r13), %r13
00000000004f1049	cmpq	%rbx, %r13
00000000004f104c	jne	0x4f0faf
00000000004f1052	jmp	0x4f1195
00000000004f1057	leaq	__ZTI10OZBehavior(%rip), %r14   ## typeinfo for OZBehavior
00000000004f105e	leaq	__ZTI30OZ3DEnginePhysicsFieldBehavior(%rip), %r15 ## typeinfo for OZ3DEnginePhysicsFieldBehavior
00000000004f1065	jmp	0x4f10bd
00000000004f1067	nopw	(%rax,%rax)
00000000004f1070	movq	%r14, %rsi
00000000004f1073	movq	%r15, %rdx
00000000004f1076	xorl	%ecx, %ecx
00000000004f1078	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000004f107d	movq	%rax, %r12
00000000004f1080	leaq	0x978(%r12), %rdi
00000000004f1088	movl	$0x400000, %esi                 ## imm = 0x400000
00000000004f108d	movl	$0x1, %edx
00000000004f1092	callq	0x6dd914                        ## symbol stub for: __ZN13OZChannelBase7setFlagEyb
00000000004f1097	addq	$0xa10, %r12                    ## imm = 0xA10
00000000004f109e	movl	$0x400000, %esi                 ## imm = 0x400000
00000000004f10a3	movq	%r12, %rdi
00000000004f10a6	movl	$0x1, %edx
00000000004f10ab	callq	0x6dd914                        ## symbol stub for: __ZN13OZChannelBase7setFlagEyb
00000000004f10b0	movq	0x8(%r13), %r13
00000000004f10b4	cmpq	%rbx, %r13
00000000004f10b7	je	0x4f1195
00000000004f10bd	movq	0x10(%r13), %rdi
00000000004f10c1	testq	%rdi, %rdi
00000000004f10c4	jne	0x4f1070
00000000004f10c6	xorl	%r12d, %r12d
00000000004f10c9	jmp	0x4f1080
00000000004f10cb	leaq	__ZTI30OZ3DEnginePhysicsFieldBehavior(%rip), %r12 ## typeinfo for OZ3DEnginePhysicsFieldBehavior
00000000004f10d2	jmp	0x4f10ff
00000000004f10d4	nopw	%cs:(%rax,%rax)
00000000004f10e0	movl	$0x400000, %esi                 ## imm = 0x400000
00000000004f10e5	movq	%r14, %rdi
00000000004f10e8	movl	$0x1, %edx
00000000004f10ed	callq	0x6dd92c                        ## symbol stub for: __ZN13OZChannelBase9resetFlagEyb
00000000004f10f2	movq	0x8(%r13), %r13
00000000004f10f6	cmpq	%rbx, %r13
00000000004f10f9	je	0x4f1195
00000000004f10ff	movq	0x10(%r13), %rdi
00000000004f1103	testq	%rdi, %rdi
00000000004f1106	je	0x4f1120
00000000004f1108	movq	%r15, %rsi
00000000004f110b	movq	%r12, %rdx
00000000004f110e	xorl	%ecx, %ecx
00000000004f1110	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000004f1115	movq	%rax, %r14
00000000004f1118	jmp	0x4f1123
00000000004f111a	nopw	(%rax,%rax)
00000000004f1120	xorl	%r14d, %r14d
00000000004f1123	leaq	0x978(%r14), %rdi
00000000004f112a	movl	$0x400000, %esi                 ## imm = 0x400000
00000000004f112f	movl	$0x1, %edx
00000000004f1134	callq	0x6dd914                        ## symbol stub for: __ZN13OZChannelBase7setFlagEyb
00000000004f1139	leaq	0xa10(%r14), %rdi
00000000004f1140	movl	$0x400000, %esi                 ## imm = 0x400000
00000000004f1145	movl	$0x1, %edx
00000000004f114a	callq	0x6dd914                        ## symbol stub for: __ZN13OZChannelBase7setFlagEyb
00000000004f114f	leaq	0x728(%r14), %rdi
00000000004f1156	movl	$0x400000, %esi                 ## imm = 0x400000
00000000004f115b	movl	$0x1, %edx
00000000004f1160	callq	0x6dd92c                        ## symbol stub for: __ZN13OZChannelBase9resetFlagEyb
00000000004f1165	addq	$0x4d8, %r14                    ## imm = 0x4D8
00000000004f116c	cmpl	$0x0, -0x30(%rbp)
00000000004f1170	je	0x4f10e0
00000000004f1176	movl	$0x400000, %esi                 ## imm = 0x400000
00000000004f117b	movq	%r14, %rdi
00000000004f117e	movl	$0x1, %edx
00000000004f1183	callq	0x6dd914                        ## symbol stub for: __ZN13OZChannelBase7setFlagEyb
00000000004f1188	movq	0x8(%r13), %r13
00000000004f118c	cmpq	%rbx, %r13
00000000004f118f	jne	0x4f10ff
00000000004f1195	addq	$0x28, %rsp
00000000004f1199	popq	%rbx
00000000004f119a	popq	%r12
00000000004f119c	popq	%r13
00000000004f119e	popq	%r14
00000000004f11a0	popq	%r15
00000000004f11a2	popq	%rbp
00000000004f11a3	retq
00000000004f11a4	nopw	%cs:(%rax,%rax)
