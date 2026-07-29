===== __ZN10HGAppleLog6EncodeC2ENS_16SceneColorimetryENS_14LogColorimetryE =====
__ZN10HGAppleLog6EncodeC2ENS_16SceneColorimetryENS_14LogColorimetryE:
0000000000102f30	pushq	%rbp
0000000000102f31	movq	%rsp, %rbp
0000000000102f34	pushq	%r15
0000000000102f36	pushq	%r14
0000000000102f38	pushq	%r12
0000000000102f3a	pushq	%rbx
0000000000102f3b	movl	%edx, %r15d
0000000000102f3e	movl	%esi, %r14d
0000000000102f41	movq	%rdi, %rbx
0000000000102f44	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000102f49	leaq	0x915cf0(%rip), %rax
0000000000102f50	movq	%rax, (%rbx)
0000000000102f53	movq	$0x0, 0x198(%rbx)
0000000000102f5e	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000102f63	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000102f68	movq	%rax, %r12
0000000000102f6b	movq	%rax, %rdi
0000000000102f6e	callq	__ZN18HgcAppleLog_encodeC1Ev    ## HgcAppleLog_encode::HgcAppleLog_encode()
0000000000102f73	movq	%r12, 0x1a0(%rbx)
0000000000102f7a	movq	$0x0, 0x1a8(%rbx)
0000000000102f85	testl	%r15d, %r15d
0000000000102f88	je	0x102fbf
0000000000102f8a	cmpl	$0x1, %r15d
0000000000102f8e	jne	0x102fee
0000000000102f90	movl	$0x1f0, %edi                    ## imm = 0x1F0
0000000000102f95	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000102f9a	movq	%rax, %r15
0000000000102f9d	movq	%rax, %rdi
0000000000102fa0	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
0000000000102fa5	movq	%r15, 0x198(%rbx)
0000000000102fac	movl	%r14d, %ecx
0000000000102faf	shlq	$0x6, %rcx
0000000000102fb3	leaq	__ZN10HGAppleLog6Encode22sourceToAppleWideGamutE(%rip), %rax ## HGAppleLog::Encode::sourceToAppleWideGamut
0000000000102fba	addq	%rcx, %rax
0000000000102fbd	jmp	0x102fe7
0000000000102fbf	testl	%r14d, %r14d
0000000000102fc2	jne	0x102fee
0000000000102fc4	movl	$0x1f0, %edi                    ## imm = 0x1F0
0000000000102fc9	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000102fce	movq	%rax, %r15
0000000000102fd1	movq	%rax, %rdi
0000000000102fd4	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
0000000000102fd9	movq	%r15, 0x198(%rbx)
0000000000102fe0	leaq	__ZN12HGColorGamma21rec709RGBToRec2020RGBE(%rip), %rax ## HGColorGamma::rec709RGBToRec2020RGB
0000000000102fe7	movq	%rax, 0x1a8(%rbx)
0000000000102fee	popq	%rbx
0000000000102fef	popq	%r12
0000000000102ff1	popq	%r14
0000000000102ff3	popq	%r15
0000000000102ff5	popq	%rbp
0000000000102ff6	retq
0000000000102ff7	jmp	0x102ff9
0000000000102ff9	movq	%rax, %r14
0000000000102ffc	movq	%r15, %rdi
0000000000102fff	jmp	0x103007
0000000000103001	movq	%rax, %r14
0000000000103004	movq	%r12, %rdi
0000000000103007	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000010300c	movq	%rbx, %rdi
000000000010300f	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000103014	movq	%r14, %rdi
0000000000103017	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000010301c	movq	%rax, %r14
000000000010301f	movq	%rbx, %rdi
0000000000103022	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000103027	movq	%r14, %rdi
000000000010302a	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000010302f	nop
===== __ZN10HGAppleLog6EncodeC1ENS_16SceneColorimetryENS_14LogColorimetryE =====
__ZN10HGAppleLog6EncodeC1ENS_16SceneColorimetryENS_14LogColorimetryE:
0000000000103030	pushq	%rbp
0000000000103031	movq	%rsp, %rbp
0000000000103034	popq	%rbp
0000000000103035	jmp	__ZN10HGAppleLog6EncodeC2ENS_16SceneColorimetryENS_14LogColorimetryE ## HGAppleLog::Encode::Encode(HGAppleLog::SceneColorimetry, HGAppleLog::LogColorimetry)
000000000010303a	nopw	(%rax,%rax)
===== __ZN10HGAppleLog6EncodeD2Ev =====
__ZN10HGAppleLog6EncodeD2Ev:
0000000000103040	pushq	%rbp
0000000000103041	movq	%rsp, %rbp
0000000000103044	pushq	%rbx
0000000000103045	pushq	%rax
0000000000103046	movq	%rdi, %rbx
0000000000103049	leaq	0x915bf0(%rip), %rax
0000000000103050	movq	%rax, (%rdi)
0000000000103053	movq	0x198(%rdi), %rdi
000000000010305a	testq	%rdi, %rdi
000000000010305d	je	0x103065
000000000010305f	movq	(%rdi), %rax
0000000000103062	callq	*0x18(%rax)
0000000000103065	movq	0x1a0(%rbx), %rdi
000000000010306c	testq	%rdi, %rdi
000000000010306f	je	0x103077
0000000000103071	movq	(%rdi), %rax
0000000000103074	callq	*0x18(%rax)
0000000000103077	movq	%rbx, %rdi
000000000010307a	addq	$0x8, %rsp
000000000010307e	popq	%rbx
000000000010307f	popq	%rbp
0000000000103080	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000103085	movq	%rax, %rdi
0000000000103088	callq	___clang_call_terminate
000000000010308d	nopl	(%rax)
===== __ZN10HGAppleLog6EncodeD1Ev =====
__ZN10HGAppleLog6EncodeD1Ev:
0000000000103090	pushq	%rbp
0000000000103091	movq	%rsp, %rbp
0000000000103094	pushq	%rbx
0000000000103095	pushq	%rax
0000000000103096	movq	%rdi, %rbx
0000000000103099	leaq	0x915ba0(%rip), %rax
00000000001030a0	movq	%rax, (%rdi)
00000000001030a3	movq	0x198(%rdi), %rdi
00000000001030aa	testq	%rdi, %rdi
00000000001030ad	je	0x1030b5
00000000001030af	movq	(%rdi), %rax
00000000001030b2	callq	*0x18(%rax)
00000000001030b5	movq	0x1a0(%rbx), %rdi
00000000001030bc	testq	%rdi, %rdi
00000000001030bf	je	0x1030c7
00000000001030c1	movq	(%rdi), %rax
00000000001030c4	callq	*0x18(%rax)
00000000001030c7	movq	%rbx, %rdi
00000000001030ca	addq	$0x8, %rsp
00000000001030ce	popq	%rbx
00000000001030cf	popq	%rbp
00000000001030d0	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001030d5	movq	%rax, %rdi
00000000001030d8	callq	___clang_call_terminate
00000000001030dd	nopl	(%rax)
===== __ZN10HGAppleLog6EncodeD0Ev =====
__ZN10HGAppleLog6EncodeD0Ev:
00000000001030e0	pushq	%rbp
00000000001030e1	movq	%rsp, %rbp
00000000001030e4	pushq	%rbx
00000000001030e5	pushq	%rax
00000000001030e6	movq	%rdi, %rbx
00000000001030e9	leaq	0x915b50(%rip), %rax
00000000001030f0	movq	%rax, (%rdi)
00000000001030f3	movq	0x198(%rdi), %rdi
00000000001030fa	testq	%rdi, %rdi
00000000001030fd	je	0x103105
00000000001030ff	movq	(%rdi), %rax
0000000000103102	callq	*0x18(%rax)
0000000000103105	movq	0x1a0(%rbx), %rdi
000000000010310c	testq	%rdi, %rdi
000000000010310f	je	0x103117
0000000000103111	movq	(%rdi), %rax
0000000000103114	callq	*0x18(%rax)
0000000000103117	movq	%rbx, %rdi
000000000010311a	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000010311f	movq	%rbx, %rdi
0000000000103122	addq	$0x8, %rsp
0000000000103126	popq	%rbx
0000000000103127	popq	%rbp
0000000000103128	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000010312d	movq	%rax, %rdi
0000000000103130	callq	___clang_call_terminate
0000000000103135	nopw	%cs:(%rax,%rax)
