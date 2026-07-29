__ZN28FFOZBlindDataCustomUIChannel30InitOZBlindDataCustomUIChannelEv:
0000000000218cc0	pushq	%rbp
0000000000218cc1	movq	%rsp, %rbp
0000000000218cc4	pushq	%r14
0000000000218cc6	pushq	%rbx
0000000000218cc7	subq	$0x20, %rsp
0000000000218ccb	movq	%rdi, %rbx
0000000000218cce	movq	__ZN36FFOZBlindDataCustomUIChannel_Factory13_instanceOnceE(%rip), %rax ## FFOZBlindDataCustomUIChannel_Factory::_instanceOnce
0000000000218cd5	cmpq	$-0x1, %rax
0000000000218cd9	je	0x218d02
0000000000218cdb	leaq	-0x11(%rbp), %rax
0000000000218cdf	movq	%rax, -0x28(%rbp)
0000000000218ce3	leaq	-0x28(%rbp), %rax
0000000000218ce7	movq	%rax, -0x20(%rbp)
0000000000218ceb	leaq	__ZN36FFOZBlindDataCustomUIChannel_Factory13_instanceOnceE(%rip), %rdi ## FFOZBlindDataCustomUIChannel_Factory::_instanceOnce
0000000000218cf2	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN36FFOZBlindDataCustomUIChannel_Factory11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<FFOZBlindDataCustomUIChannel_Factory::getInstance()::'lambda'()&&>>(void*)
0000000000218cf9	leaq	-0x20(%rbp), %rsi
0000000000218cfd	callq	0x14972ae                       ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
0000000000218d02	movq	__ZN36FFOZBlindDataCustomUIChannel_Factory9_instanceE(%rip), %rax ## FFOZBlindDataCustomUIChannel_Factory::_instance
0000000000218d09	movq	%rax, 0x8(%rbx)
0000000000218d0d	movq	__ZL41FFOZBlindDataCustomUIChannelInfo_Instance(%rip), %r14 ## FFOZBlindDataCustomUIChannelInfo_Instance
0000000000218d14	testq	%r14, %r14
0000000000218d17	jne	0x218d7b
0000000000218d19	movl	$0x58, %edi
0000000000218d1e	callq	0x1497452                       ## symbol stub for: __Znwm
0000000000218d23	movq	%rax, %r14
0000000000218d26	leaq	0x147932b(%rip), %rsi           ## literal pool for: ""
0000000000218d2d	movsd	0x1355edb(%rip), %xmm1
0000000000218d35	movsd	0x1353cc3(%rip), %xmm2
0000000000218d3d	xorps	%xmm0, %xmm0
0000000000218d40	movq	%rax, %rdi
0000000000218d43	movaps	%xmm2, %xmm3
0000000000218d46	movaps	%xmm2, %xmm4
0000000000218d49	callq	0x14962be                       ## symbol stub for: __ZN13OZChannelInfoC2EdddddPKc
0000000000218d4e	movq	%r14, %rdi
0000000000218d51	addq	$0x50, %rdi
0000000000218d55	movl	$0x64, %esi
0000000000218d5a	callq	0x1495fee                       ## symbol stub for: __ZN11PCSingletonC2Ej
0000000000218d5f	leaq	0x16dc2ea(%rip), %rax
0000000000218d66	movq	%rax, (%r14)
0000000000218d69	leaq	0x16dc300(%rip), %rax
0000000000218d70	movq	%rax, 0x50(%r14)
0000000000218d74	movq	%r14, __ZL41FFOZBlindDataCustomUIChannelInfo_Instance(%rip) ## FFOZBlindDataCustomUIChannelInfo_Instance
0000000000218d7b	movq	%r14, 0x88(%rbx)
0000000000218d82	movq	%r14, 0x80(%rbx)
0000000000218d89	addq	$0x20, %rsp
0000000000218d8d	popq	%rbx
0000000000218d8e	popq	%r14
0000000000218d90	popq	%rbp
0000000000218d91	retq
0000000000218d92	movq	%rax, %rbx
0000000000218d95	movq	%r14, %rdi
0000000000218d98	callq	0x14962c4                       ## symbol stub for: __ZN13OZChannelInfoD2Ev
0000000000218d9d	movq	%r14, %rdi
0000000000218da0	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000218da5	movq	%rbx, %rdi
0000000000218da8	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000218dad	movq	%rax, %rbx
0000000000218db0	movq	%r14, %rdi
0000000000218db3	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000218db8	movq	%rbx, %rdi
0000000000218dbb	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
