__ZN18HGCPUComputeDeviceC2Ev:
0000000000117000	pushq	%rbp
0000000000117001	movq	%rsp, %rbp
0000000000117004	pushq	%r15
0000000000117006	pushq	%r14
0000000000117008	pushq	%rbx
0000000000117009	subq	$0x88, %rsp
0000000000117010	movq	%rdi, %rbx
0000000000117013	movq	0x8eb23e(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
000000000011701a	movq	(%rax), %rax
000000000011701d	movq	%rax, -0x20(%rbp)
0000000000117021	xorl	%esi, %esi
0000000000117023	callq	__ZN15HGComputeDeviceC2ENS_4TypeE ## HGComputeDevice::HGComputeDevice(HGComputeDevice::Type)
0000000000117028	leaq	0x9061d9(%rip), %rax
000000000011702f	movq	%rax, (%rbx)
0000000000117032	leaq	0x48(%rbx), %r14
0000000000117036	xorps	%xmm0, %xmm0
0000000000117039	movups	%xmm0, 0x48(%rbx)
000000000011703d	movups	%xmm0, 0x58(%rbx)
0000000000117041	movups	%xmm0, 0x68(%rbx)
0000000000117045	movq	$0x0, 0x78(%rbx)
000000000011704d	movq	$0x64, -0x98(%rbp)
0000000000117058	leaq	0x7d0fae(%rip), %rdi            ## literal pool for: "machdep.cpu.brand_string"
000000000011705f	leaq	-0x90(%rbp), %rsi
0000000000117066	leaq	-0x98(%rbp), %rdx
000000000011706d	xorl	%ecx, %ecx
000000000011706f	xorl	%r8d, %r8d
0000000000117072	callq	0x3c5636                        ## symbol stub for: _sysctlbyname
0000000000117077	leaq	-0x90(%rbp), %rsi
000000000011707e	movq	%r14, %rdi
0000000000117081	callq	0x3c4e44                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc
0000000000117086	movl	$0x0, -0x98(%rbp)
0000000000117090	movq	$0x4, -0x90(%rbp)
000000000011709b	leaq	0x7d0f84(%rip), %rdi            ## literal pool for: "hw.physicalcpu"
00000000001170a2	leaq	-0x98(%rbp), %rsi
00000000001170a9	leaq	-0x90(%rbp), %rdx
00000000001170b0	xorl	%ecx, %ecx
00000000001170b2	xorl	%r8d, %r8d
00000000001170b5	callq	0x3c5636                        ## symbol stub for: _sysctlbyname
00000000001170ba	movl	-0x98(%rbp), %eax
00000000001170c0	movl	%eax, 0x60(%rbx)
00000000001170c3	movl	$0x0, -0x98(%rbp)
00000000001170cd	movq	$0x4, -0x90(%rbp)
00000000001170d8	leaq	0x7d0f56(%rip), %rdi            ## literal pool for: "hw.activecpu"
00000000001170df	leaq	-0x98(%rbp), %rsi
00000000001170e6	leaq	-0x90(%rbp), %rdx
00000000001170ed	xorl	%ecx, %ecx
00000000001170ef	xorl	%r8d, %r8d
00000000001170f2	callq	0x3c5636                        ## symbol stub for: _sysctlbyname
00000000001170f7	movl	-0x98(%rbp), %eax
00000000001170fd	movl	%eax, 0x64(%rbx)
0000000000117100	movq	$0x8, -0x98(%rbp)
000000000011710b	movabsq	$0x1800000006, %rax             ## imm = 0x1800000006
0000000000117115	movq	%rax, -0x28(%rbp)
0000000000117119	leaq	-0x28(%rbp), %rdi
000000000011711d	leaq	-0x90(%rbp), %rdx
0000000000117124	leaq	-0x98(%rbp), %rcx
000000000011712b	movl	$0x2, %esi
0000000000117130	xorl	%r8d, %r8d
0000000000117133	xorl	%r9d, %r9d
0000000000117136	callq	0x3c5630                        ## symbol stub for: _sysctl
000000000011713b	movq	-0x90(%rbp), %rax
0000000000117142	movq	%rax, 0x68(%rbx)
0000000000117146	movq	$0x0, -0x90(%rbp)
0000000000117151	movq	$0x8, -0x98(%rbp)
000000000011715c	leaq	0x7d0edf(%rip), %rdi            ## literal pool for: "hw.l1dcachesize"
0000000000117163	leaq	-0x90(%rbp), %rsi
000000000011716a	leaq	-0x98(%rbp), %rdx
0000000000117171	xorl	%ecx, %ecx
0000000000117173	xorl	%r8d, %r8d
0000000000117176	callq	0x3c5636                        ## symbol stub for: _sysctlbyname
000000000011717b	movq	-0x90(%rbp), %rax
0000000000117182	movq	%rax, 0x70(%rbx)
0000000000117186	movq	$0x0, -0x90(%rbp)
0000000000117191	movq	$0x8, -0x98(%rbp)
000000000011719c	leaq	0x7d0eaf(%rip), %rdi            ## literal pool for: "hw.l2cachesize"
00000000001171a3	leaq	-0x90(%rbp), %rsi
00000000001171aa	leaq	-0x98(%rbp), %rdx
00000000001171b1	xorl	%ecx, %ecx
00000000001171b3	xorl	%r8d, %r8d
00000000001171b6	callq	0x3c5636                        ## symbol stub for: _sysctlbyname
00000000001171bb	movq	-0x90(%rbp), %rax
00000000001171c2	movq	%rax, 0x78(%rbx)
00000000001171c6	movl	$0xffffffff, 0x40(%rbx)         ## imm = 0xFFFFFFFF
00000000001171cd	movq	0x8eb084(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001171d4	movq	(%rax), %rax
00000000001171d7	cmpq	-0x20(%rbp), %rax
00000000001171db	jne	0x1171eb
00000000001171dd	addq	$0x88, %rsp
00000000001171e4	popq	%rbx
00000000001171e5	popq	%r14
00000000001171e7	popq	%r15
00000000001171e9	popq	%rbp
00000000001171ea	retq
00000000001171eb	callq	0x3c5030                        ## symbol stub for: ___stack_chk_fail
00000000001171f0	movq	%rax, %r15
00000000001171f3	testb	$0x1, (%r14)
00000000001171f7	je	0x117202
00000000001171f9	movq	0x58(%rbx), %rdi
00000000001171fd	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000117202	movq	%rbx, %rdi
0000000000117205	callq	__ZN15HGComputeDeviceD2Ev       ## HGComputeDevice::~HGComputeDevice()
000000000011720a	movq	%r15, %rdi
000000000011720d	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000117212	nopw	%cs:(%rax,%rax)
