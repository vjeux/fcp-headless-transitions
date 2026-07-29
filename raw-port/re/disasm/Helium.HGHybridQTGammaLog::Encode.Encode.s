__ZN18HGHybridQTGammaLog6EncodeC1ENS_11CurveParamsE:
0000000000101e90	pushq	%rbp
0000000000101e91	movq	%rsp, %rbp
0000000000101e94	pushq	%r15
0000000000101e96	pushq	%r14
0000000000101e98	pushq	%rbx
0000000000101e99	pushq	%rax
0000000000101e9a	movl	%esi, %r14d
0000000000101e9d	movq	%rdi, %rbx
0000000000101ea0	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000101ea5	leaq	0x916254(%rip), %rax
0000000000101eac	movq	%rax, (%rbx)
0000000000101eaf	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000101eb4	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000101eb9	movq	%rax, %r15
0000000000101ebc	movq	%rax, %rdi
0000000000101ebf	callq	__ZN26HgcHybridQTGammaLog_encodeC1Ev ## HgcHybridQTGammaLog_encode::HgcHybridQTGammaLog_encode()
0000000000101ec4	movq	%r15, 0x198(%rbx)
0000000000101ecb	movl	%r14d, %eax
0000000000101ece	shlq	$0x5, %rax
0000000000101ed2	leaq	__ZN18HGHybridQTGammaLog10calcParamsE(%rip), %rcx ## HGHybridQTGammaLog::calcParams
0000000000101ed9	movsd	0x8(%rax,%rcx), %xmm0
0000000000101edf	mulsd	0x2cef51(%rip), %xmm0
0000000000101ee7	movsd	(%rax,%rcx), %xmm1
0000000000101eec	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
0000000000101ef0	cvtpd2ps	0x10(%rax,%rcx), %xmm0
0000000000101ef6	cvtpd2ps	%xmm1, %xmm1
0000000000101efa	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
0000000000101efe	movapd	%xmm1, 0x1a0(%rbx)
0000000000101f06	addq	$0x8, %rsp
0000000000101f0a	popq	%rbx
0000000000101f0b	popq	%r14
0000000000101f0d	popq	%r15
0000000000101f0f	popq	%rbp
0000000000101f10	retq
0000000000101f11	movq	%rax, %r14
0000000000101f14	movq	%r15, %rdi
0000000000101f17	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000101f1c	movq	%rbx, %rdi
0000000000101f1f	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000101f24	movq	%r14, %rdi
0000000000101f27	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000101f2c	movq	%rax, %r14
0000000000101f2f	movq	%rbx, %rdi
0000000000101f32	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000101f37	movq	%r14, %rdi
0000000000101f3a	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000101f3f	nop
