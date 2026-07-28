__ZN8HGTiming27GetMachTimeConversionFactorEv:
000000000006d100	cmpq	$-0x1, __ZZN8HGTiming27GetMachTimeConversionFactorEvE9onceToken(%rip) ## HGTiming::GetMachTimeConversionFactor()::onceToken
000000000006d108	jne	0x6d113
000000000006d10a	movsd	__ZZN8HGTiming27GetMachTimeConversionFactorEvE10conversion(%rip), %xmm0 ## HGTiming::GetMachTimeConversionFactor()::conversion
000000000006d112	retq
000000000006d113	pushq	%rbp
000000000006d114	movq	%rsp, %rbp
000000000006d117	callq	__ZN8HGTiming27GetMachTimeConversionFactorEv.cold.1 ## HGTiming::GetMachTimeConversionFactor() (.cold.1)
000000000006d11c	popq	%rbp
000000000006d11d	movsd	__ZZN8HGTiming27GetMachTimeConversionFactorEvE10conversion(%rip), %xmm0 ## HGTiming::GetMachTimeConversionFactor()::conversion
000000000006d125	retq
000000000006d126	nopw	%cs:(%rax,%rax)
____ZN8HGTiming27GetMachTimeConversionFactorEv_block_invoke:
000000000006d130	pushq	%rbp
000000000006d131	movq	%rsp, %rbp
000000000006d134	subq	$0x10, %rsp
000000000006d138	leaq	-0x8(%rbp), %rdi
000000000006d13c	callq	0x3c5420                        ## symbol stub for: _mach_timebase_info
000000000006d141	testl	%eax, %eax
000000000006d143	je	0x6d14b
000000000006d145	addq	$0x10, %rsp
000000000006d149	popq	%rbp
000000000006d14a	retq
000000000006d14b	movl	-0x8(%rbp), %eax
000000000006d14e	movl	-0x4(%rbp), %ecx
000000000006d151	cvtsi2sd	%rax, %xmm0
000000000006d156	mulsd	0x35fada(%rip), %xmm0
000000000006d15e	cvtsi2sd	%rcx, %xmm1
000000000006d163	divsd	%xmm1, %xmm0
000000000006d167	movsd	%xmm0, __ZZN8HGTiming27GetMachTimeConversionFactorEvE10conversion(%rip) ## HGTiming::GetMachTimeConversionFactor()::conversion
000000000006d16f	addq	$0x10, %rsp
000000000006d173	popq	%rbp
000000000006d174	retq
000000000006d175	nopw	%cs:(%rax,%rax)
__ZNSt3__16__treeINS_12__value_typeINS_10shared_ptrIK18HGGPUComputeDeviceEEbEENS_19__map_value_compareIS5_NS_4pairIKS5_bEENS_4lessIS5_EELb1EEENS_9allocatorISA_EEE7destroyEPNS_11__tree_nodeIS6_PvEE:
000000000006d180	testq	%rsi, %rsi
000000000006d183	je	0x6d1de
000000000006d185	pushq	%rbp
