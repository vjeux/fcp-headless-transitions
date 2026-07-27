__ZN17OZChannelPositionC2EddRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo:
00000000000737fa	pushq	%rbp
00000000000737fb	movq	%rsp, %rbp
00000000000737fe	pushq	%r15
0000000000073800	pushq	%r14
0000000000073802	pushq	%r13
0000000000073804	pushq	%r12
0000000000073806	pushq	%rbx
0000000000073807	subq	$0x38, %rsp
000000000007380b	movl	%r9d, %r14d
000000000007380e	movl	%r8d, -0x30(%rbp)
0000000000073812	movl	%ecx, -0x2c(%rbp)
0000000000073815	movq	%rdx, -0x48(%rbp)
0000000000073819	movq	%rsi, %r13
000000000007381c	movsd	%xmm1, -0x40(%rbp)
0000000000073821	movsd	%xmm0, -0x38(%rbp)
0000000000073826	movq	%rdi, %rbx
0000000000073829	movq	0x10(%rbp), %r12
000000000007382d	leaq	0x697f4(%rip), %rax
0000000000073834	movq	%rax, (%rdi)
0000000000073837	leaq	0x69b32(%rip), %rax
000000000007383e	movq	%rax, 0x10(%rdi)
0000000000073842	callq	__ZN25OZChannelPosition_Factory11getInstanceEv ## OZChannelPosition_Factory::getInstance()
0000000000073847	movq	%rax, %r15
000000000007384a	testq	%r12, %r12
000000000007384d	jne	0x73857
000000000007384f	callq	__ZN17OZChannelPosition27OZChannelPosition_valueImpl11getInstanceEv ## OZChannelPosition::OZChannelPosition_valueImpl::getInstance()
0000000000073854	movq	%rax, %r12
0000000000073857	movq	0x18(%rbp), %rax
000000000007385b	movq	%rax, 0x10(%rsp)
0000000000073860	movq	%r12, 0x8(%rsp)
0000000000073865	movl	%r14d, (%rsp)
0000000000073869	movq	%rbx, %rdi
000000000007386c	movsd	-0x38(%rbp), %xmm0
0000000000073871	movsd	-0x40(%rbp), %xmm1
0000000000073876	movq	%r15, %rsi
0000000000073879	movq	%r13, %rdx
000000000007387c	movq	-0x48(%rbp), %rcx
0000000000073880	movl	-0x2c(%rbp), %r8d
0000000000073884	movl	-0x30(%rbp), %r9d
0000000000073888	callq	__ZN11OZChannel2DC2EddP9OZFactoryRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo ## OZChannel2D::OZChannel2D(double, double, OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
000000000007388d	leaq	0x69794(%rip), %rax
0000000000073894	movq	%rax, (%rbx)
0000000000073897	leaq	0x69ad2(%rip), %rax
000000000007389e	movq	%rax, 0x10(%rbx)
00000000000738a2	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000000738ac	movq	%rax, 0x238(%rbx)
00000000000738b3	movq	%rax, 0x210(%rbx)
00000000000738ba	movq	%rax, 0x1e8(%rbx)
00000000000738c1	movq	%rax, 0x1c0(%rbx)
00000000000738c8	xorps	%xmm0, %xmm0
00000000000738cb	movups	%xmm0, 0x1c8(%rbx)
00000000000738d2	movups	%xmm0, 0x1d8(%rbx)
00000000000738d9	movups	%xmm0, 0x1f0(%rbx)
00000000000738e0	movups	%xmm0, 0x200(%rbx)
00000000000738e7	movups	%xmm0, 0x218(%rbx)
00000000000738ee	movups	%xmm0, 0x228(%rbx)
00000000000738f5	movl	$0x0, 0x2bc(%rbx)
00000000000738ff	movups	%xmm0, 0x240(%rbx)
0000000000073906	movups	%xmm0, 0x250(%rbx)
000000000007390d	movups	%xmm0, 0x260(%rbx)
0000000000073914	movups	%xmm0, 0x270(%rbx)
000000000007391b	movups	%xmm0, 0x280(%rbx)
0000000000073922	movups	%xmm0, 0x290(%rbx)
0000000000073929	movups	%xmm0, 0x2a0(%rbx)
0000000000073930	movq	$0x0, 0x2b0(%rbx)
000000000007393b	cmpq	$0x0, 0x18(%rbp)
0000000000073940	jne	0x73978
0000000000073942	leaq	0x240(%rbx), %r12
0000000000073949	leaq	0x2bc(%rbx), %r15
0000000000073950	callq	__ZN17OZChannelPosition27OZChannelPosition_valueInfo11getInstanceEv ## OZChannelPosition::OZChannelPosition_valueInfo::getInstance()
0000000000073955	leaq	0x88(%rbx), %rdi
000000000007395c	movq	%rax, %rsi
000000000007395f	callq	__ZN9OZChannel11replaceInfoEP13OZChannelInfo ## OZChannel::replaceInfo(OZChannelInfo*)
0000000000073964	callq	__ZN17OZChannelPosition27OZChannelPosition_valueInfo11getInstanceEv ## OZChannelPosition::OZChannelPosition_valueInfo::getInstance()
0000000000073969	leaq	0x120(%rbx), %rdi
0000000000073970	movq	%rax, %rsi
0000000000073973	callq	__ZN9OZChannel11replaceInfoEP13OZChannelInfo ## OZChannel::replaceInfo(OZChannelInfo*)
0000000000073978	movb	$0x1, 0x1b8(%rbx)
000000000007397f	movl	$0x0, 0x2b8(%rbx)
0000000000073989	addq	$0x38, %rsp
000000000007398d	popq	%rbx
000000000007398e	popq	%r12
0000000000073990	popq	%r13
0000000000073992	popq	%r14
0000000000073994	popq	%r15
0000000000073996	popq	%rbp
0000000000073997	retq
0000000000073998	movq	%rax, %r14
000000000007399b	movq	%r15, %rdi
000000000007399e	callq	0xacb22                         ## symbol stub for: __ZN10PCSpinLockD1Ev
00000000000739a3	movq	0x2a0(%rbx), %rdi
00000000000739aa	testq	%rdi, %rdi
00000000000739ad	je	0x739bb
00000000000739af	movq	%rdi, 0x2a8(%rbx)
00000000000739b6	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000739bb	movq	0x288(%rbx), %rdi
00000000000739c2	testq	%rdi, %rdi
00000000000739c5	je	0x739d3
00000000000739c7	movq	%rdi, 0x290(%rbx)
00000000000739ce	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000739d3	movq	0x270(%rbx), %rdi
00000000000739da	testq	%rdi, %rdi
00000000000739dd	je	0x739eb
00000000000739df	movq	%rdi, 0x278(%rbx)
00000000000739e6	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000739eb	movq	0x258(%rbx), %rdi
00000000000739f2	testq	%rdi, %rdi
00000000000739f5	je	0x73a03
00000000000739f7	movq	%rdi, 0x260(%rbx)
00000000000739fe	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000073a03	movq	(%r12), %rdi
0000000000073a07	testq	%rdi, %rdi
0000000000073a0a	je	0x73a18
0000000000073a0c	movq	%rdi, 0x248(%rbx)
0000000000073a13	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000073a18	movq	%rbx, %rdi
0000000000073a1b	callq	__ZN11OZChannel2DD2Ev           ## OZChannel2D::~OZChannel2D()
0000000000073a20	movq	%r14, %rdi
0000000000073a23	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
