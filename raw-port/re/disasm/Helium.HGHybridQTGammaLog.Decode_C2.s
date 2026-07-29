__ZN18HGHybridQTGammaLog6DecodeC2ENS_11CurveParamsE:
00000000001020a0	pushq	%rbp
00000000001020a1	movq	%rsp, %rbp
00000000001020a4	pushq	%r15
00000000001020a6	pushq	%r14
00000000001020a8	pushq	%rbx
00000000001020a9	pushq	%rax
00000000001020aa	movl	%esi, %r14d
00000000001020ad	movq	%rdi, %rbx
00000000001020b0	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000001020b5	leaq	0x916284(%rip), %rax
00000000001020bc	movq	%rax, (%rbx)
00000000001020bf	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000001020c4	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001020c9	movq	%rax, %r15
00000000001020cc	movq	%rax, %rdi
00000000001020cf	callq	__ZN26HgcHybridQTGammaLog_decodeC1Ev ## HgcHybridQTGammaLog_decode::HgcHybridQTGammaLog_decode()
00000000001020d4	movq	%r15, 0x198(%rbx)
00000000001020db	movl	%r14d, %r14d
00000000001020de	shlq	$0x5, %r14
00000000001020e2	leaq	__ZN18HGHybridQTGammaLog10calcParamsE(%rip), %r15 ## HGHybridQTGammaLog::calcParams
00000000001020e9	movsd	(%r14,%r15), %xmm0
00000000001020ef	movsd	0x8(%r14,%r15), %xmm1
00000000001020f6	movsd	%xmm1, -0x20(%rbp)
00000000001020fb	movsd	0x2ced3d(%rip), %xmm1
0000000000102103	callq	0x3c54ec                        ## symbol stub for: _pow
0000000000102108	movsd	-0x20(%rbp), %xmm2
000000000010210d	mulsd	0x2ced23(%rip), %xmm2
0000000000102115	movsd	0x2c8143(%rip), %xmm1
000000000010211d	divsd	%xmm2, %xmm1
0000000000102121	movapd	%xmm2, %xmm3
0000000000102125	movsd	0x18(%r14,%r15), %xmm2
000000000010212c	xorpd	0x2c89ac(%rip), %xmm2
0000000000102134	divsd	%xmm3, %xmm2
0000000000102138	movsd	0x10(%r14,%r15), %xmm3
000000000010213f	unpcklpd	%xmm2, %xmm3                    ## xmm3 = xmm3[0],xmm2[0]
0000000000102143	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
0000000000102147	cvtpd2ps	%xmm0, %xmm0
000000000010214b	cvtpd2ps	%xmm3, %xmm1
000000000010214f	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
0000000000102153	movapd	%xmm0, 0x1a0(%rbx)
000000000010215b	addq	$0x8, %rsp
000000000010215f	popq	%rbx
0000000000102160	popq	%r14
0000000000102162	popq	%r15
0000000000102164	popq	%rbp
0000000000102165	retq
0000000000102166	movq	%rax, %r14
0000000000102169	movq	%r15, %rdi
000000000010216c	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000102171	movq	%rbx, %rdi
0000000000102174	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000102179	movq	%r14, %rdi
000000000010217c	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000102181	movq	%rax, %r14
0000000000102184	movq	%rbx, %rdi
0000000000102187	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000010218c	movq	%r14, %rdi
000000000010218f	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000102194	nopw	%cs:(%rax,%rax)
