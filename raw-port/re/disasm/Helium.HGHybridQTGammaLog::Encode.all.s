__ZN18HGHybridQTGammaLog6EncodeC2ENS_11CurveParamsE:
0000000000101de0	pushq	%rbp
0000000000101de1	movq	%rsp, %rbp
0000000000101de4	pushq	%r15
0000000000101de6	pushq	%r14
0000000000101de8	pushq	%rbx
0000000000101de9	pushq	%rax
0000000000101dea	movl	%esi, %r14d
0000000000101ded	movq	%rdi, %rbx
0000000000101df0	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000101df5	leaq	0x916304(%rip), %rax
0000000000101dfc	movq	%rax, (%rbx)
0000000000101dff	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000101e04	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000101e09	movq	%rax, %r15
0000000000101e0c	movq	%rax, %rdi
0000000000101e0f	callq	__ZN26HgcHybridQTGammaLog_encodeC1Ev ## HgcHybridQTGammaLog_encode::HgcHybridQTGammaLog_encode()
0000000000101e14	movq	%r15, 0x198(%rbx)
0000000000101e1b	movl	%r14d, %eax
0000000000101e1e	shlq	$0x5, %rax
0000000000101e22	leaq	__ZN18HGHybridQTGammaLog10calcParamsE(%rip), %rcx ## HGHybridQTGammaLog::calcParams
0000000000101e29	movsd	0x8(%rax,%rcx), %xmm0
0000000000101e2f	mulsd	0x2cf001(%rip), %xmm0
0000000000101e37	movsd	(%rax,%rcx), %xmm1
0000000000101e3c	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
0000000000101e40	cvtpd2ps	0x10(%rax,%rcx), %xmm0
0000000000101e46	cvtpd2ps	%xmm1, %xmm1
0000000000101e4a	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
0000000000101e4e	movapd	%xmm1, 0x1a0(%rbx)
0000000000101e56	addq	$0x8, %rsp
0000000000101e5a	popq	%rbx
0000000000101e5b	popq	%r14
0000000000101e5d	popq	%r15
0000000000101e5f	popq	%rbp
0000000000101e60	retq
0000000000101e61	movq	%rax, %r14
0000000000101e64	movq	%r15, %rdi
0000000000101e67	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000101e6c	movq	%rbx, %rdi
0000000000101e6f	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000101e74	movq	%r14, %rdi
0000000000101e77	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000101e7c	movq	%rax, %r14
0000000000101e7f	movq	%rbx, %rdi
0000000000101e82	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000101e87	movq	%r14, %rdi
0000000000101e8a	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000101e8f	nop
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
__ZN18HGHybridQTGammaLog6EncodeD2Ev:
0000000000101f40	pushq	%rbp
0000000000101f41	movq	%rsp, %rbp
0000000000101f44	pushq	%rbx
0000000000101f45	pushq	%rax
0000000000101f46	leaq	0x9161b3(%rip), %rax
0000000000101f4d	movq	%rax, (%rdi)
0000000000101f50	movq	0x198(%rdi), %rax
0000000000101f57	testq	%rax, %rax
0000000000101f5a	je	0x101f6b
0000000000101f5c	movq	(%rax), %rcx
0000000000101f5f	movq	%rdi, %rbx
0000000000101f62	movq	%rax, %rdi
0000000000101f65	callq	*0x18(%rcx)
0000000000101f68	movq	%rbx, %rdi
0000000000101f6b	addq	$0x8, %rsp
0000000000101f6f	popq	%rbx
0000000000101f70	popq	%rbp
0000000000101f71	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000101f76	movq	%rax, %rdi
0000000000101f79	callq	___clang_call_terminate
0000000000101f7e	nop
__ZN18HGHybridQTGammaLog6EncodeD1Ev:
0000000000101f80	pushq	%rbp
0000000000101f81	movq	%rsp, %rbp
0000000000101f84	pushq	%rbx
0000000000101f85	pushq	%rax
0000000000101f86	leaq	0x916173(%rip), %rax
0000000000101f8d	movq	%rax, (%rdi)
0000000000101f90	movq	0x198(%rdi), %rax
0000000000101f97	testq	%rax, %rax
0000000000101f9a	je	0x101fab
0000000000101f9c	movq	(%rax), %rcx
0000000000101f9f	movq	%rdi, %rbx
0000000000101fa2	movq	%rax, %rdi
0000000000101fa5	callq	*0x18(%rcx)
0000000000101fa8	movq	%rbx, %rdi
0000000000101fab	addq	$0x8, %rsp
0000000000101faf	popq	%rbx
0000000000101fb0	popq	%rbp
0000000000101fb1	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000101fb6	movq	%rax, %rdi
0000000000101fb9	callq	___clang_call_terminate
0000000000101fbe	nop
__ZN18HGHybridQTGammaLog6EncodeD0Ev:
0000000000101fc0	pushq	%rbp
0000000000101fc1	movq	%rsp, %rbp
0000000000101fc4	pushq	%rbx
0000000000101fc5	pushq	%rax
0000000000101fc6	movq	%rdi, %rbx
0000000000101fc9	leaq	0x916130(%rip), %rax
0000000000101fd0	movq	%rax, (%rdi)
0000000000101fd3	movq	0x198(%rdi), %rdi
0000000000101fda	testq	%rdi, %rdi
0000000000101fdd	je	0x101fe5
0000000000101fdf	movq	(%rdi), %rax
0000000000101fe2	callq	*0x18(%rax)
0000000000101fe5	movq	%rbx, %rdi
0000000000101fe8	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000101fed	movq	%rbx, %rdi
0000000000101ff0	addq	$0x8, %rsp
0000000000101ff4	popq	%rbx
0000000000101ff5	popq	%rbp
0000000000101ff6	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000101ffb	movq	%rax, %rdi
0000000000101ffe	callq	___clang_call_terminate
0000000000102003	nopw	%cs:(%rax,%rax)
__ZN18HGHybridQTGammaLog6Encode9GetOutputEP10HGRenderer:
0000000000102010	pushq	%rbp
0000000000102011	movq	%rsp, %rbp
0000000000102014	pushq	%r14
0000000000102016	pushq	%rbx
0000000000102017	movq	%rdi, %rbx
000000000010201a	movq	0x198(%rdi), %r14
0000000000102021	movq	%rsi, %rdi
0000000000102024	movq	%rbx, %rsi
0000000000102027	xorl	%edx, %edx
0000000000102029	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
000000000010202e	movq	(%r14), %rcx
0000000000102031	movq	%r14, %rdi
0000000000102034	xorl	%esi, %esi
0000000000102036	movq	%rax, %rdx
0000000000102039	callq	*0x78(%rcx)
000000000010203c	movq	0x198(%rbx), %rdi
0000000000102043	movss	0x1a0(%rbx), %xmm0
000000000010204b	movq	(%rdi), %rax
000000000010204e	xorps	%xmm1, %xmm1
0000000000102051	xorps	%xmm2, %xmm2
0000000000102054	xorps	%xmm3, %xmm3
0000000000102057	xorl	%esi, %esi
0000000000102059	callq	*0x60(%rax)
000000000010205c	movq	0x198(%rbx), %rdi
0000000000102063	movss	0x1a4(%rbx), %xmm1
000000000010206b	movss	0x1a8(%rbx), %xmm2
0000000000102073	movss	0x1ac(%rbx), %xmm3
000000000010207b	movq	(%rdi), %rax
000000000010207e	movss	0x2cef32(%rip), %xmm0
0000000000102086	movl	$0x1, %esi
000000000010208b	callq	*0x60(%rax)
000000000010208e	movq	0x198(%rbx), %rax
0000000000102095	popq	%rbx
0000000000102096	popq	%r14
0000000000102098	popq	%rbp
0000000000102099	retq
000000000010209a	nopw	(%rax,%rax)