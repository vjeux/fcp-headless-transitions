
/tmp/Ozone.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

00000000001d0c80 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState>:
  1d0c80: 55                           	pushq	%rbp
  1d0c81: 48 89 e5                     	movq	%rsp, %rbp
  1d0c84: 41 57                        	pushq	%r15
  1d0c86: 41 56                        	pushq	%r14
  1d0c88: 41 55                        	pushq	%r13
  1d0c8a: 41 54                        	pushq	%r12
  1d0c8c: 53                           	pushq	%rbx
  1d0c8d: 48 81 ec e8 01 00 00         	subq	$0x1e8, %rsp            ## imm = 0x1E8
  1d0c94: 49 89 d6                     	movq	%rdx, %r14
  1d0c97: 48 89 f3                     	movq	%rsi, %rbx
  1d0c9a: 49 89 ff                     	movq	%rdi, %r15
  1d0c9d: 49 bd 00 00 00 00 00 00 f0 3f	movabsq	$0x3ff0000000000000, %r13 ## imm = 0x3FF0000000000000
  1d0ca7: 4c 89 6d 90                  	movq	%r13, -0x70(%rbp)
  1d0cab: 4c 89 ad 78 ff ff ff         	movq	%r13, -0x88(%rbp)
  1d0cb2: 4c 89 6d 80                  	movq	%r13, -0x80(%rbp)
  1d0cb6: 48 39 7a 38                  	cmpq	%rdi, 0x38(%rdx)
  1d0cba: 0f 84 05 02 00 00            	je	0x1d0ec5 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x245>
  1d0cc0: 49 8b 86 f8 00 00 00         	movq	0xf8(%r14), %rax
  1d0cc7: a9 00 38 00 00               	testl	$0x3800, %eax           ## imm = 0x3800
  1d0ccc: 0f 84 43 02 00 00            	je	0x1d0f15 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x295>
  1d0cd2: 49 8d bf 40 05 00 00         	leaq	0x540(%r15), %rdi
  1d0cd9: 66 0f 57 c0                  	xorpd	%xmm0, %xmm0
  1d0cdd: 4c 89 f6                     	movq	%r14, %rsi
  1d0ce0: e8 b9 ed 50 00               	callq	0x6dfa9e <_wmemchr+0x6dfa9e>
  1d0ce5: f2 0f 11 45 b0               	movsd	%xmm0, -0x50(%rbp)
  1d0cea: 49 8d bf d8 05 00 00         	leaq	0x5d8(%r15), %rdi
  1d0cf1: 66 0f 57 c0                  	xorpd	%xmm0, %xmm0
  1d0cf5: 4c 89 f6                     	movq	%r14, %rsi
  1d0cf8: e8 a1 ed 50 00               	callq	0x6dfa9e <_wmemchr+0x6dfa9e>
  1d0cfd: f2 0f 11 45 c0               	movsd	%xmm0, -0x40(%rbp)
  1d0d02: 49 8d bf 98 07 00 00         	leaq	0x798(%r15), %rdi
  1d0d09: 66 0f 57 c0                  	xorpd	%xmm0, %xmm0
  1d0d0d: 4c 89 f6                     	movq	%r14, %rsi
  1d0d10: e8 89 ed 50 00               	callq	0x6dfa9e <_wmemchr+0x6dfa9e>
  1d0d15: 66 0f 29 85 60 ff ff ff      	movapd	%xmm0, -0xa0(%rbp)
  1d0d1d: 49 8b 86 f8 00 00 00         	movq	0xf8(%r14), %rax
  1d0d24: a9 c0 01 00 00               	testl	$0x1c0, %eax            ## imm = 0x1C0
  1d0d29: 74 28                        	je	0x1d0d53 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0xd3>
  1d0d2b: 49 8b 07                     	movq	(%r15), %rax
  1d0d2e: 48 8d 75 90                  	leaq	-0x70(%rbp), %rsi
  1d0d32: 48 8d 95 78 ff ff ff         	leaq	-0x88(%rbp), %rdx
  1d0d39: 48 8d 4d 80                  	leaq	-0x80(%rbp), %rcx
  1d0d3d: 4c 89 ff                     	movq	%r15, %rdi
  1d0d40: 4d 89 f0                     	movq	%r14, %r8
  1d0d43: 45 31 c9                     	xorl	%r9d, %r9d
  1d0d46: ff 90 38 05 00 00            	callq	*0x538(%rax)
  1d0d4c: 49 8b 86 f8 00 00 00         	movq	0xf8(%r14), %rax
  1d0d53: 66 0f 57 c0                  	xorpd	%xmm0, %xmm0
  1d0d57: f2 0f 11 45 a0               	movsd	%xmm0, -0x60(%rbp)
  1d0d5c: f2 0f 11 45 d0               	movsd	%xmm0, -0x30(%rbp)
  1d0d61: f2 0f 11 45 a8               	movsd	%xmm0, -0x58(%rbp)
  1d0d66: a8 38                        	testb	$0x38, %al
  1d0d68: 74 46                        	je	0x1d0db0 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x130>
  1d0d6a: 49 8d bf b8 08 00 00         	leaq	0x8b8(%r15), %rdi
  1d0d71: 4c 89 f6                     	movq	%r14, %rsi
  1d0d74: e8 25 ed 50 00               	callq	0x6dfa9e <_wmemchr+0x6dfa9e>
  1d0d79: f2 0f 11 45 d0               	movsd	%xmm0, -0x30(%rbp)
  1d0d7e: 49 8d bf 50 09 00 00         	leaq	0x950(%r15), %rdi
  1d0d85: 66 0f 57 c0                  	xorpd	%xmm0, %xmm0
  1d0d89: 4c 89 f6                     	movq	%r14, %rsi
  1d0d8c: e8 0d ed 50 00               	callq	0x6dfa9e <_wmemchr+0x6dfa9e>
  1d0d91: f2 0f 11 45 a8               	movsd	%xmm0, -0x58(%rbp)
  1d0d96: 49 8d bf e8 09 00 00         	leaq	0x9e8(%r15), %rdi
  1d0d9d: 66 0f 57 c0                  	xorpd	%xmm0, %xmm0
  1d0da1: 4c 89 f6                     	movq	%r14, %rsi
  1d0da4: e8 f5 ec 50 00               	callq	0x6dfa9e <_wmemchr+0x6dfa9e>
  1d0da9: 49 8b 86 f8 00 00 00         	movq	0xf8(%r14), %rax
  1d0db0: f2 0f 11 45 98               	movsd	%xmm0, -0x68(%rbp)
  1d0db5: 66 0f 57 ff                  	xorpd	%xmm7, %xmm7
  1d0db9: a9 00 06 00 00               	testl	$0x600, %eax            ## imm = 0x600
  1d0dbe: 74 36                        	je	0x1d0df6 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x176>
  1d0dc0: 49 8d bf 28 14 00 00         	leaq	0x1428(%r15), %rdi
  1d0dc7: 66 0f 57 c0                  	xorpd	%xmm0, %xmm0
  1d0dcb: 4c 89 f6                     	movq	%r14, %rsi
  1d0dce: e8 cb ec 50 00               	callq	0x6dfa9e <_wmemchr+0x6dfa9e>
  1d0dd3: f2 0f 11 45 a0               	movsd	%xmm0, -0x60(%rbp)
  1d0dd8: 49 8d bf c0 14 00 00         	leaq	0x14c0(%r15), %rdi
  1d0ddf: 66 0f 57 c0                  	xorpd	%xmm0, %xmm0
  1d0de3: 4c 89 f6                     	movq	%r14, %rsi
  1d0de6: e8 b3 ec 50 00               	callq	0x6dfa9e <_wmemchr+0x6dfa9e>
  1d0deb: 66 0f 28 f8                  	movapd	%xmm0, %xmm7
  1d0def: 49 8b 86 f8 00 00 00         	movq	0xf8(%r14), %rax
  1d0df6: a8 07                        	testb	$0x7, %al
  1d0df8: 0f 84 3d 01 00 00            	je	0x1d0f3b <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x2bb>
  1d0dfe: 49 8d bf e0 15 00 00         	leaq	0x15e0(%r15), %rdi
  1d0e05: 66 0f 57 c0                  	xorpd	%xmm0, %xmm0
  1d0e09: 4c 89 f6                     	movq	%r14, %rsi
  1d0e0c: f2 0f 11 7d 88               	movsd	%xmm7, -0x78(%rbp)
  1d0e11: e8 88 ec 50 00               	callq	0x6dfa9e <_wmemchr+0x6dfa9e>
  1d0e16: f2 0f 11 45 b8               	movsd	%xmm0, -0x48(%rbp)
  1d0e1b: 49 8d bf 78 16 00 00         	leaq	0x1678(%r15), %rdi
  1d0e22: 66 0f 57 c0                  	xorpd	%xmm0, %xmm0
  1d0e26: 4c 89 f6                     	movq	%r14, %rsi
  1d0e29: e8 70 ec 50 00               	callq	0x6dfa9e <_wmemchr+0x6dfa9e>
  1d0e2e: f2 0f 11 45 c8               	movsd	%xmm0, -0x38(%rbp)
  1d0e33: 49 8d bf 38 18 00 00         	leaq	0x1838(%r15), %rdi
  1d0e3a: 66 0f 57 c0                  	xorpd	%xmm0, %xmm0
  1d0e3e: 4c 89 f6                     	movq	%r14, %rsi
  1d0e41: e8 58 ec 50 00               	callq	0x6dfa9e <_wmemchr+0x6dfa9e>
  1d0e46: f2 0f 10 7d 88               	movsd	-0x78(%rbp), %xmm7
  1d0e4b: 49 8b 86 f8 00 00 00         	movq	0xf8(%r14), %rax
  1d0e52: 89 c1                        	movl	%eax, %ecx
  1d0e54: f7 d1                        	notl	%ecx
  1d0e56: f7 c1 ff 3f 00 00            	testl	$0x3fff, %ecx           ## imm = 0x3FFF
  1d0e5c: 0f 85 f7 00 00 00            	jne	0x1d0f59 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x2d9>
  1d0e62: f2 0f 10 4d b0               	movsd	-0x50(%rbp), %xmm1
  1d0e67: 0f 29 8d 40 ff ff ff         	movaps	%xmm1, -0xc0(%rbp)
  1d0e6e: f2 0f 10 4d c0               	movsd	-0x40(%rbp), %xmm1
  1d0e73: 0f 29 8d 50 ff ff ff         	movaps	%xmm1, -0xb0(%rbp)
  1d0e7a: f2 0f 10 4d d0               	movsd	-0x30(%rbp), %xmm1
  1d0e7f: f2 0f 11 4d 88               	movsd	%xmm1, -0x78(%rbp)
  1d0e84: f2 0f 10 4d a8               	movsd	-0x58(%rbp), %xmm1
  1d0e89: f2 0f 11 4d b0               	movsd	%xmm1, -0x50(%rbp)
  1d0e8e: f2 0f 10 4d 98               	movsd	-0x68(%rbp), %xmm1
  1d0e93: f2 0f 11 4d d0               	movsd	%xmm1, -0x30(%rbp)
  1d0e98: f2 0f 10 4d a0               	movsd	-0x60(%rbp), %xmm1
  1d0e9d: f2 0f 11 4d c0               	movsd	%xmm1, -0x40(%rbp)
  1d0ea2: f2 0f 11 7d 98               	movsd	%xmm7, -0x68(%rbp)
  1d0ea7: f2 0f 10 4d b8               	movsd	-0x48(%rbp), %xmm1
  1d0eac: f2 0f 11 4d a0               	movsd	%xmm1, -0x60(%rbp)
  1d0eb1: f2 0f 10 4d c8               	movsd	-0x38(%rbp), %xmm1
  1d0eb6: f2 0f 11 4d a8               	movsd	%xmm1, -0x58(%rbp)
  1d0ebb: f2 0f 11 45 b8               	movsd	%xmm0, -0x48(%rbp)
  1d0ec0: e9 84 01 00 00               	jmp	0x1d1049 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x3c9>
  1d0ec5: 4c 89 6b 78                  	movq	%r13, 0x78(%rbx)
  1d0ec9: 4c 89 6b 50                  	movq	%r13, 0x50(%rbx)
  1d0ecd: 4c 89 6b 28                  	movq	%r13, 0x28(%rbx)
  1d0ed1: 4c 89 2b                     	movq	%r13, (%rbx)
  1d0ed4: 66 0f 57 c0                  	xorpd	%xmm0, %xmm0
  1d0ed8: 66 0f 11 43 08               	movupd	%xmm0, 0x8(%rbx)
  1d0edd: 66 0f 11 43 18               	movupd	%xmm0, 0x18(%rbx)
  1d0ee2: 66 0f 11 43 30               	movupd	%xmm0, 0x30(%rbx)
  1d0ee7: 66 0f 11 43 40               	movupd	%xmm0, 0x40(%rbx)
  1d0eec: 66 0f 11 43 58               	movupd	%xmm0, 0x58(%rbx)
  1d0ef1: 66 0f 11 43 68               	movupd	%xmm0, 0x68(%rbx)
  1d0ef6: 41 80 be c9 00 00 00 00      	cmpb	$0x0, 0xc9(%r14)
  1d0efe: 0f 85 c2 05 00 00            	jne	0x1d14c6 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x846>
  1d0f04: 49 8b 07                     	movq	(%r15), %rax
  1d0f07: 4c 89 ff                     	movq	%r15, %rdi
  1d0f0a: ff 90 48 05 00 00            	callq	*0x548(%rax)
  1d0f10: e9 81 05 00 00               	jmp	0x1d1496 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x816>
  1d0f15: 66 0f 57 c0                  	xorpd	%xmm0, %xmm0
  1d0f19: f2 0f 11 45 b0               	movsd	%xmm0, -0x50(%rbp)
  1d0f1e: f2 0f 11 45 c0               	movsd	%xmm0, -0x40(%rbp)
  1d0f23: 66 0f 29 85 60 ff ff ff      	movapd	%xmm0, -0xa0(%rbp)
  1d0f2b: a9 c0 01 00 00               	testl	$0x1c0, %eax            ## imm = 0x1C0
  1d0f30: 0f 85 f5 fd ff ff            	jne	0x1d0d2b <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0xab>
  1d0f36: e9 18 fe ff ff               	jmp	0x1d0d53 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0xd3>
  1d0f3b: 66 0f 57 c0                  	xorpd	%xmm0, %xmm0
  1d0f3f: f2 0f 11 45 b8               	movsd	%xmm0, -0x48(%rbp)
  1d0f44: f2 0f 11 45 c8               	movsd	%xmm0, -0x38(%rbp)
  1d0f49: 89 c1                        	movl	%eax, %ecx
  1d0f4b: f7 d1                        	notl	%ecx
  1d0f4d: f7 c1 ff 3f 00 00            	testl	$0x3fff, %ecx           ## imm = 0x3FFF
  1d0f53: 0f 84 09 ff ff ff            	je	0x1d0e62 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x1e2>
  1d0f59: 66 0f 57 c9                  	xorpd	%xmm1, %xmm1
  1d0f5d: 66 0f 57 d2                  	xorpd	%xmm2, %xmm2
  1d0f61: a8 01                        	testb	$0x1, %al
  1d0f63: 0f 85 6c 01 00 00            	jne	0x1d10d5 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x455>
  1d0f69: 0f 57 db                     	xorps	%xmm3, %xmm3
  1d0f6c: a8 02                        	testb	$0x2, %al
  1d0f6e: 0f 85 71 01 00 00            	jne	0x1d10e5 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x465>
  1d0f74: 66 0f 57 e4                  	xorpd	%xmm4, %xmm4
  1d0f78: a8 04                        	testb	$0x4, %al
  1d0f7a: 0f 85 76 01 00 00            	jne	0x1d10f6 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x476>
  1d0f80: f2 0f 11 65 b8               	movsd	%xmm4, -0x48(%rbp)
  1d0f85: 66 0f 57 c0                  	xorpd	%xmm0, %xmm0
  1d0f89: a8 08                        	testb	$0x8, %al
  1d0f8b: 0f 85 7a 01 00 00            	jne	0x1d110b <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x48b>
  1d0f91: 66 0f 57 e4                  	xorpd	%xmm4, %xmm4
  1d0f95: a8 10                        	testb	$0x10, %al
  1d0f97: 0f 85 7f 01 00 00            	jne	0x1d111c <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x49c>
  1d0f9d: a8 20                        	testb	$0x20, %al
  1d0f9f: 0f 85 84 01 00 00            	jne	0x1d1129 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x4a9>
  1d0fa5: a8 40                        	testb	$0x40, %al
  1d0fa7: 0f 84 89 01 00 00            	je	0x1d1136 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x4b6>
  1d0fad: 84 c0                        	testb	%al, %al
  1d0faf: 0f 89 8d 01 00 00            	jns	0x1d1142 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x4c2>
  1d0fb5: f2 0f 11 45 88               	movsd	%xmm0, -0x78(%rbp)
  1d0fba: a9 00 01 00 00               	testl	$0x100, %eax            ## imm = 0x100
  1d0fbf: 0f 84 94 01 00 00            	je	0x1d1159 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x4d9>
  1d0fc5: 66 0f 57 c0                  	xorpd	%xmm0, %xmm0
  1d0fc9: 0f 57 ed                     	xorps	%xmm5, %xmm5
  1d0fcc: a9 00 02 00 00               	testl	$0x200, %eax            ## imm = 0x200
  1d0fd1: 0f 85 98 01 00 00            	jne	0x1d116f <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x4ef>
  1d0fd7: 66 0f 57 f6                  	xorpd	%xmm6, %xmm6
  1d0fdb: a9 00 04 00 00               	testl	$0x400, %eax            ## imm = 0x400
  1d0fe0: 0f 85 9d 01 00 00            	jne	0x1d1183 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x503>
  1d0fe6: 66 0f 57 ff                  	xorpd	%xmm7, %xmm7
  1d0fea: a9 00 08 00 00               	testl	$0x800, %eax            ## imm = 0x800
  1d0fef: 0f 85 a1 01 00 00            	jne	0x1d1196 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x516>
  1d0ff5: 45 0f 57 c0                  	xorps	%xmm8, %xmm8
  1d0ff9: a9 00 10 00 00               	testl	$0x1000, %eax           ## imm = 0x1000
  1d0ffe: 0f 85 a6 01 00 00            	jne	0x1d11aa <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x52a>
  1d1004: a9 00 20 00 00               	testl	$0x2000, %eax           ## imm = 0x2000
  1d1009: 74 08                        	je	0x1d1013 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x393>
  1d100b: 66 0f 28 85 60 ff ff ff      	movapd	-0xa0(%rbp), %xmm0
  1d1013: 44 0f 29 85 50 ff ff ff      	movaps	%xmm8, -0xb0(%rbp)
  1d101b: 66 0f 29 bd 40 ff ff ff      	movapd	%xmm7, -0xc0(%rbp)
  1d1023: f2 0f 11 75 98               	movsd	%xmm6, -0x68(%rbp)
  1d1028: f2 0f 11 6d c0               	movsd	%xmm5, -0x40(%rbp)
  1d102d: f2 0f 11 65 b0               	movsd	%xmm4, -0x50(%rbp)
  1d1032: f2 0f 11 5d a8               	movsd	%xmm3, -0x58(%rbp)
  1d1037: f2 0f 11 55 a0               	movsd	%xmm2, -0x60(%rbp)
  1d103c: f2 0f 11 4d d0               	movsd	%xmm1, -0x30(%rbp)
  1d1041: 66 0f 29 85 60 ff ff ff      	movapd	%xmm0, -0xa0(%rbp)
  1d1049: 49 8b 07                     	movq	(%r15), %rax
  1d104c: 4c 89 ff                     	movq	%r15, %rdi
  1d104f: ff 90 48 05 00 00            	callq	*0x548(%rax)
  1d1055: 49 8b bf b8 03 00 00         	movq	0x3b8(%r15), %rdi
  1d105c: 48 85 ff                     	testq	%rdi, %rdi
  1d105f: 74 4a                        	je	0x1d10ab <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x42b>
  1d1061: 66 0f 29 85 30 ff ff ff      	movapd	%xmm0, -0xd0(%rbp)
  1d1069: 48 8d 35 38 38 66 00         	leaq	0x663838(%rip), %rsi    ## 0x8348a8 <__ZTI11OZSceneNode>
  1d1070: 48 8d 15 39 16 67 00         	leaq	0x671639(%rip), %rdx    ## 0x8426b0 <__ZTI15OZTransformNode>
  1d1077: 31 c9                        	xorl	%ecx, %ecx
  1d1079: e8 90 ec 50 00               	callq	0x6dfd0e <_wmemchr+0x6dfd0e>
  1d107e: 49 89 c4                     	movq	%rax, %r12
  1d1081: 49 8d 86 c9 00 00 00         	leaq	0xc9(%r14), %rax
  1d1088: 48 89 45 c8                  	movq	%rax, -0x38(%rbp)
  1d108c: 41 80 be c9 00 00 00 00      	cmpb	$0x0, 0xc9(%r14)
  1d1094: 75 31                        	jne	0x1d10c7 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x447>
  1d1096: 4d 85 e4                     	testq	%r12, %r12
  1d1099: 0f 84 29 01 00 00            	je	0x1d11c8 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x548>
  1d109f: 49 8b 04 24                  	movq	(%r12), %rax
  1d10a3: 4c 89 e7                     	movq	%r12, %rdi
  1d10a6: e9 3f 01 00 00               	jmp	0x1d11ea <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x56a>
  1d10ab: 49 8d 86 c9 00 00 00         	leaq	0xc9(%r14), %rax
  1d10b2: 48 89 45 c8                  	movq	%rax, -0x38(%rbp)
  1d10b6: 45 31 e4                     	xorl	%r12d, %r12d
  1d10b9: 41 80 be c9 00 00 00 00      	cmpb	$0x0, 0xc9(%r14)
  1d10c1: 0f 84 f9 00 00 00            	je	0x1d11c0 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x540>
  1d10c7: f2 44 0f 10 05 10 43 53 00   	movsd	0x534310(%rip), %xmm8   ## 0x7053e0 <_OzoneVersionNumber+0x30>
  1d10d0: e9 5e 01 00 00               	jmp	0x1d1233 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x5b3>
  1d10d5: f2 0f 10 55 b8               	movsd	-0x48(%rbp), %xmm2
  1d10da: 0f 57 db                     	xorps	%xmm3, %xmm3
  1d10dd: a8 02                        	testb	$0x2, %al
  1d10df: 0f 84 8f fe ff ff            	je	0x1d0f74 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x2f4>
  1d10e5: f2 0f 10 5d c8               	movsd	-0x38(%rbp), %xmm3
  1d10ea: 66 0f 57 e4                  	xorpd	%xmm4, %xmm4
  1d10ee: a8 04                        	testb	$0x4, %al
  1d10f0: 0f 84 8a fe ff ff            	je	0x1d0f80 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x300>
  1d10f6: 66 0f 28 e0                  	movapd	%xmm0, %xmm4
  1d10fa: f2 0f 11 65 b8               	movsd	%xmm4, -0x48(%rbp)
  1d10ff: 66 0f 57 c0                  	xorpd	%xmm0, %xmm0
  1d1103: a8 08                        	testb	$0x8, %al
  1d1105: 0f 84 86 fe ff ff            	je	0x1d0f91 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x311>
  1d110b: f2 0f 10 45 d0               	movsd	-0x30(%rbp), %xmm0
  1d1110: 66 0f 57 e4                  	xorpd	%xmm4, %xmm4
  1d1114: a8 10                        	testb	$0x10, %al
  1d1116: 0f 84 81 fe ff ff            	je	0x1d0f9d <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x31d>
  1d111c: f2 0f 10 65 a8               	movsd	-0x58(%rbp), %xmm4
  1d1121: a8 20                        	testb	$0x20, %al
  1d1123: 0f 84 7c fe ff ff            	je	0x1d0fa5 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x325>
  1d1129: f2 0f 10 4d 98               	movsd	-0x68(%rbp), %xmm1
  1d112e: a8 40                        	testb	$0x40, %al
  1d1130: 0f 85 77 fe ff ff            	jne	0x1d0fad <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x32d>
  1d1136: 4c 89 6d 90                  	movq	%r13, -0x70(%rbp)
  1d113a: 84 c0                        	testb	%al, %al
  1d113c: 0f 88 73 fe ff ff            	js	0x1d0fb5 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x335>
  1d1142: 4c 89 ad 78 ff ff ff         	movq	%r13, -0x88(%rbp)
  1d1149: f2 0f 11 45 88               	movsd	%xmm0, -0x78(%rbp)
  1d114e: a9 00 01 00 00               	testl	$0x100, %eax            ## imm = 0x100
  1d1153: 0f 85 6c fe ff ff            	jne	0x1d0fc5 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x345>
  1d1159: 4c 89 6d 80                  	movq	%r13, -0x80(%rbp)
  1d115d: 66 0f 57 c0                  	xorpd	%xmm0, %xmm0
  1d1161: 0f 57 ed                     	xorps	%xmm5, %xmm5
  1d1164: a9 00 02 00 00               	testl	$0x200, %eax            ## imm = 0x200
  1d1169: 0f 84 68 fe ff ff            	je	0x1d0fd7 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x357>
  1d116f: f2 0f 10 6d a0               	movsd	-0x60(%rbp), %xmm5
  1d1174: 66 0f 57 f6                  	xorpd	%xmm6, %xmm6
  1d1178: a9 00 04 00 00               	testl	$0x400, %eax            ## imm = 0x400
  1d117d: 0f 84 63 fe ff ff            	je	0x1d0fe6 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x366>
  1d1183: 66 0f 28 f7                  	movapd	%xmm7, %xmm6
  1d1187: 66 0f 57 ff                  	xorpd	%xmm7, %xmm7
  1d118b: a9 00 08 00 00               	testl	$0x800, %eax            ## imm = 0x800
  1d1190: 0f 84 5f fe ff ff            	je	0x1d0ff5 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x375>
  1d1196: f2 0f 10 7d b0               	movsd	-0x50(%rbp), %xmm7
  1d119b: 45 0f 57 c0                  	xorps	%xmm8, %xmm8
  1d119f: a9 00 10 00 00               	testl	$0x1000, %eax           ## imm = 0x1000
  1d11a4: 0f 84 5a fe ff ff            	je	0x1d1004 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x384>
  1d11aa: f2 44 0f 10 45 c0            	movsd	-0x40(%rbp), %xmm8
  1d11b0: a9 00 20 00 00               	testl	$0x2000, %eax           ## imm = 0x2000
  1d11b5: 0f 85 50 fe ff ff            	jne	0x1d100b <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x38b>
  1d11bb: e9 53 fe ff ff               	jmp	0x1d1013 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x393>
  1d11c0: 66 0f 29 85 30 ff ff ff      	movapd	%xmm0, -0xd0(%rbp)
  1d11c8: 49 8b 07                     	movq	(%r15), %rax
  1d11cb: 4c 89 ff                     	movq	%r15, %rdi
  1d11ce: ff 90 10 01 00 00            	callq	*0x110(%rax)
  1d11d4: 48 85 c0                     	testq	%rax, %rax
  1d11d7: 74 0b                        	je	0x1d11e4 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x564>
  1d11d9: f2 44 0f 10 80 c0 00 00 00   	movsd	0xc0(%rax), %xmm8
  1d11e2: eb 11                        	jmp	0x1d11f5 <__ZNK15OZTransformNode18getTransformMatrixEP14PCMatrix44TmplIdERK13OZRenderState+0x575>
  1d11e4: 49 8b 07                     	movq	(%r15), %rax
  1d11e7: 4c 89 ff                     	movq	%r15, %rdi
  1d11ea: ff 90 48 05 00 00            	callq	*0x548(%rax)
  1d11f0: 66 44 0f 28 c0               	movapd	%xmm0, %xmm8
  1d11f5: 66 0f 57 c9                  	xorpd	%xmm1, %xmm1
  1d11f9: 66 41 0f 28 c0               	movapd	%xmm8, %xmm0
  1d11fe: f2 0f c2 c1 00               	cmpeqsd	%xmm1, %xmm0
  1d1203: 66 44 0f 38 15 05 d3 5b 53 00	blendvpd	%xmm0, 0x535bd3(%rip), %xmm8 ## 0x706de0 <__ZTS27OZ3DEngineSceneFile_Factory+0x24>
  1d120d: 66 0f 28 95 30 ff ff ff      	movapd	-0xd0(%rbp), %xmm2
  1d1215: 66 0f 28 c2                  	movapd	%xmm2, %xmm0
  1d1219: f2 0f c2 c1 00               	cmpeqsd	%xmm1, %xmm0
  1d121e: 66 41 0f 38 15 d0            	blendvpd	%xmm0, %xmm8, %xmm2
  1d1224: f2 41 0f 5e d0               	divsd	%xmm8, %xmm2
  1d1229: f2 0f 59 55 90               	mulsd	-0x70(%rbp), %xmm2
  1d122e: f2 0f 11 55 90               	movsd	%xmm2, -0x70(%rbp)
  1d1233: f2 0f 10 6d d0               	movsd	-0x30(%rbp), %xmm5
  1d1238: 66 0f 28 8d 40 ff ff ff      	movapd	-0xc0(%rbp), %xmm1
  1d1240: 66 0f 28 a5 50 ff ff ff      	movapd	-0xb0(%rbp), %xmm4
  1d1248: 66 0f 28 15 c0 5b 53 00      	movapd	0x535bc0(%rip), %xmm2   ## 0x706e10 <__ZTS27OZ3DEngineSceneFile_Factory+0x54>
